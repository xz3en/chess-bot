// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Provides {@linkcode ServerSentEvent} and
 * {@linkcode ServerSentEventStreamTarget} which provides an interface to send
 * server sent events to a browser using the DOM event model.
 *
 * The {@linkcode ServerSentEventStreamTarget} provides the `.asResponse()` or
 * `.asResponseInit()` to provide a body and headers to the client to establish
 * the event connection. This is accomplished by keeping a connection open to
 * the client by not closing the body, which allows events to be sent down the
 * connection and processed by the client browser.
 *
 * See more about Server-sent events on [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
 *
 * ## Example
 *
 * ```ts
 * import {
 *   ServerSentEvent,
 *   ServerSentEventStreamTarget,
 * } from "https://deno.land/std@$STD_VERSION/http/server_sent_event.ts";
 *
 * Deno.serve({ port: 8000 }, (request) => {
 *   const target = new ServerSentEventStreamTarget();
 *   let counter = 0;
 *
 *   // Sends an event every 2 seconds, incrementing the ID
 *   const id = setInterval(() => {
 *     const evt = new ServerSentEvent(
 *       "message",
 *       { data: { hello: "world" }, id: counter++ },
 *     );
 *     target.dispatchEvent(evt);
 *   }, 2000);
 *
 *   target.addEventListener("close", () => clearInterval(id));
 *   return target.asResponse();
 * });
 * ```
 *
 * @module
 */ import { assert } from "../assert/assert.ts";
const encoder = new TextEncoder();
const DEFAULT_KEEP_ALIVE_INTERVAL = 30_000;
class CloseEvent extends Event {
    constructor(eventInit){
        super("close", eventInit);
    }
}
/** An event which contains information which will be sent to the remote
 * connection and be made available in an `EventSource` as an event. A server
 * creates new events and dispatches them on the target which will then be
 * sent to a client.
 *
 * See more about Server-sent events on [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
 *
 * ### Example
 *
 * ```ts
 * import {
 *   ServerSentEvent,
 *   ServerSentEventStreamTarget,
 * } from "https://deno.land/std@$STD_VERSION/http/server_sent_event.ts";
 *
 * Deno.serve({ port: 8000 }, (request) => {
 *   const target = new ServerSentEventStreamTarget();
 *   const evt = new ServerSentEvent("message", {
 *     data: { hello: "world" },
 *     id: 1
 *   });
 *   target.dispatchEvent(evt);
 *   return target.asResponse();
 * });
 * ```
 */ export class ServerSentEvent extends Event {
    #data;
    #id;
    #type;
    /**
   * @param type the event type that will be available on the client. The type
   *             of `"message"` will be handled specifically as a message
   *             server-side event.
   * @param eventInit initialization options for the event
   */ constructor(type, eventInit = {}){
        super(type, eventInit);
        const { data , replacer , space  } = eventInit;
        this.#type = type;
        try {
            this.#data = typeof data === "string" ? data : data !== undefined ? JSON.stringify(data, replacer, space) : "";
        } catch (e) {
            assert(e instanceof Error);
            throw new TypeError(`data could not be coerced into a serialized string.\n  ${e.message}`);
        }
        const { id  } = eventInit;
        this.#id = id;
    }
    /** The data associated with the event, which will be sent to the client and
   * be made available in the `EventSource`. */ get data() {
        return this.#data;
    }
    /** The optional ID associated with the event that will be sent to the client
   * and be made available in the `EventSource`. */ get id() {
        return this.#id;
    }
    toString() {
        const data = `data: ${this.#data.split("\n").join("\ndata: ")}\n`;
        return `${this.#type === "__message" ? "" : `event: ${this.#type}\n`}${this.#id ? `id: ${String(this.#id)}\n` : ""}${data}\n`;
    }
}
const RESPONSE_HEADERS = [
    [
        "Connection",
        "Keep-Alive"
    ],
    [
        "Content-Type",
        "text/event-stream"
    ],
    [
        "Cache-Control",
        "no-cache"
    ],
    [
        "Keep-Alive",
        `timeout=${Number.MAX_SAFE_INTEGER}`
    ]
];
/** An implementation of {@linkcode ServerSentEventTarget} that provides a
 * readable stream as a body of a response to establish a connection to a
 * client. */ export class ServerSentEventStreamTarget extends EventTarget {
    #bodyInit;
    #closed = false;
    #controller;
    // we are ignoring any here, because when exporting to npm/Node.js, the timer
    // handle isn't a number.
    // deno-lint-ignore no-explicit-any
    #keepAliveId;
    // deno-lint-ignore no-explicit-any
    #error(error) {
        this.dispatchEvent(new CloseEvent({
            cancelable: false
        }));
        const errorEvent = new ErrorEvent("error", {
            error
        });
        this.dispatchEvent(errorEvent);
    }
    #push(payload) {
        if (!this.#controller) {
            this.#error(new Error("The controller has not been set."));
            return;
        }
        if (this.#closed) {
            return;
        }
        this.#controller.enqueue(encoder.encode(payload));
    }
    get closed() {
        return this.#closed;
    }
    constructor({ keepAlive =false  } = {}){
        super();
        this.#bodyInit = new ReadableStream({
            start: (controller)=>{
                this.#controller = controller;
            },
            cancel: (error)=>{
                // connections closing are considered "normal" for SSE events and just
                // mean the far side has closed.
                if (error instanceof Error && error.message.includes("connection closed")) {
                    this.close();
                } else {
                    this.#error(error);
                }
            }
        });
        this.addEventListener("close", ()=>{
            this.#closed = true;
            if (this.#keepAliveId != null) {
                clearInterval(this.#keepAliveId);
                this.#keepAliveId = undefined;
            }
            if (this.#controller) {
                try {
                    this.#controller.close();
                } catch  {
                // we ignore any errors here, as it is likely that the controller
                // is already closed
                }
            }
        });
        if (keepAlive) {
            const interval = typeof keepAlive === "number" ? keepAlive : DEFAULT_KEEP_ALIVE_INTERVAL;
            this.#keepAliveId = setInterval(()=>{
                this.dispatchComment("keep-alive comment");
            }, interval);
        }
    }
    /** Returns a {@linkcode Response} which contains the body and headers needed
   * to initiate a SSE connection with the client. */ asResponse(responseInit) {
        return new Response(...this.asResponseInit(responseInit));
    }
    /** Returns a tuple which contains the {@linkcode BodyInit} and
   * {@linkcode ResponseInit} needed to create a response that will establish
   * a SSE connection with the client. */ asResponseInit(responseInit = {}) {
        const headers = new Headers(responseInit.headers);
        for (const [key, value] of RESPONSE_HEADERS){
            headers.set(key, value);
        }
        responseInit.headers = headers;
        return [
            this.#bodyInit,
            responseInit
        ];
    }
    close() {
        this.dispatchEvent(new CloseEvent({
            cancelable: false
        }));
        return Promise.resolve();
    }
    dispatchComment(comment) {
        this.#push(`: ${comment.split("\n").join("\n: ")}\n\n`);
        return true;
    }
    // deno-lint-ignore no-explicit-any
    dispatchMessage(data) {
        const event = new ServerSentEvent("__message", {
            data
        });
        return this.dispatchEvent(event);
    }
    dispatchEvent(event) {
        const dispatched = super.dispatchEvent(event);
        if (dispatched && event instanceof ServerSentEvent) {
            this.#push(String(event));
        }
        return dispatched;
    }
    [Symbol.for("Deno.customInspect")](inspect) {
        return `${this.constructor.name} ${inspect({
            "#bodyInit": this.#bodyInit,
            "#closed": this.#closed
        })}`;
    }
    [Symbol.for("nodejs.util.inspect.custom")](depth, // deno-lint-ignore no-explicit-any
    options, inspect) {
        if (depth < 0) {
            return options.stylize(`[${this.constructor.name}]`, "special");
        }
        const newOptions = Object.assign({}, options, {
            depth: options.depth === null ? null : options.depth - 1
        });
        return `${options.stylize(this.constructor.name, "special")} ${inspect({
            "#bodyInit": this.#bodyInit,
            "#closed": this.#closed
        }, newOptions)}`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIwMC4wL2h0dHAvc2VydmVyX3NlbnRfZXZlbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMyB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqXG4gKiBQcm92aWRlcyB7QGxpbmtjb2RlIFNlcnZlclNlbnRFdmVudH0gYW5kXG4gKiB7QGxpbmtjb2RlIFNlcnZlclNlbnRFdmVudFN0cmVhbVRhcmdldH0gd2hpY2ggcHJvdmlkZXMgYW4gaW50ZXJmYWNlIHRvIHNlbmRcbiAqIHNlcnZlciBzZW50IGV2ZW50cyB0byBhIGJyb3dzZXIgdXNpbmcgdGhlIERPTSBldmVudCBtb2RlbC5cbiAqXG4gKiBUaGUge0BsaW5rY29kZSBTZXJ2ZXJTZW50RXZlbnRTdHJlYW1UYXJnZXR9IHByb3ZpZGVzIHRoZSBgLmFzUmVzcG9uc2UoKWAgb3JcbiAqIGAuYXNSZXNwb25zZUluaXQoKWAgdG8gcHJvdmlkZSBhIGJvZHkgYW5kIGhlYWRlcnMgdG8gdGhlIGNsaWVudCB0byBlc3RhYmxpc2hcbiAqIHRoZSBldmVudCBjb25uZWN0aW9uLiBUaGlzIGlzIGFjY29tcGxpc2hlZCBieSBrZWVwaW5nIGEgY29ubmVjdGlvbiBvcGVuIHRvXG4gKiB0aGUgY2xpZW50IGJ5IG5vdCBjbG9zaW5nIHRoZSBib2R5LCB3aGljaCBhbGxvd3MgZXZlbnRzIHRvIGJlIHNlbnQgZG93biB0aGVcbiAqIGNvbm5lY3Rpb24gYW5kIHByb2Nlc3NlZCBieSB0aGUgY2xpZW50IGJyb3dzZXIuXG4gKlxuICogU2VlIG1vcmUgYWJvdXQgU2VydmVyLXNlbnQgZXZlbnRzIG9uIFtNRE5dKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9TZXJ2ZXItc2VudF9ldmVudHMvVXNpbmdfc2VydmVyLXNlbnRfZXZlbnRzKVxuICpcbiAqICMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHtcbiAqICAgU2VydmVyU2VudEV2ZW50LFxuICogICBTZXJ2ZXJTZW50RXZlbnRTdHJlYW1UYXJnZXQsXG4gKiB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2h0dHAvc2VydmVyX3NlbnRfZXZlbnQudHNcIjtcbiAqXG4gKiBEZW5vLnNlcnZlKHsgcG9ydDogODAwMCB9LCAocmVxdWVzdCkgPT4ge1xuICogICBjb25zdCB0YXJnZXQgPSBuZXcgU2VydmVyU2VudEV2ZW50U3RyZWFtVGFyZ2V0KCk7XG4gKiAgIGxldCBjb3VudGVyID0gMDtcbiAqXG4gKiAgIC8vIFNlbmRzIGFuIGV2ZW50IGV2ZXJ5IDIgc2Vjb25kcywgaW5jcmVtZW50aW5nIHRoZSBJRFxuICogICBjb25zdCBpZCA9IHNldEludGVydmFsKCgpID0+IHtcbiAqICAgICBjb25zdCBldnQgPSBuZXcgU2VydmVyU2VudEV2ZW50KFxuICogICAgICAgXCJtZXNzYWdlXCIsXG4gKiAgICAgICB7IGRhdGE6IHsgaGVsbG86IFwid29ybGRcIiB9LCBpZDogY291bnRlcisrIH0sXG4gKiAgICAgKTtcbiAqICAgICB0YXJnZXQuZGlzcGF0Y2hFdmVudChldnQpO1xuICogICB9LCAyMDAwKTtcbiAqXG4gKiAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKFwiY2xvc2VcIiwgKCkgPT4gY2xlYXJJbnRlcnZhbChpZCkpO1xuICogICByZXR1cm4gdGFyZ2V0LmFzUmVzcG9uc2UoKTtcbiAqIH0pO1xuICogYGBgXG4gKlxuICogQG1vZHVsZVxuICovXG5cbmltcG9ydCB7IGFzc2VydCB9IGZyb20gXCIuLi9hc3NlcnQvYXNzZXJ0LnRzXCI7XG5cbmNvbnN0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcblxuY29uc3QgREVGQVVMVF9LRUVQX0FMSVZFX0lOVEVSVkFMID0gMzBfMDAwO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNlcnZlclNlbnRFdmVudEluaXQgZXh0ZW5kcyBFdmVudEluaXQge1xuICAvKiogT3B0aW9uYWwgYXJiaXRyYXJ5IGRhdGEgdG8gc2VuZCB0byB0aGUgY2xpZW50LCBkYXRhIHRoaXMgaXMgYSBzdHJpbmcgd2lsbFxuICAgKiBiZSBzZW50IHVubW9kaWZpZWQsIG90aGVyd2lzZSBgSlNPTi5wYXJzZSgpYCB3aWxsIGJlIHVzZWQgdG8gc2VyaWFsaXplIHRoZVxuICAgKiB2YWx1ZS4gKi9cbiAgZGF0YT86IHVua25vd247XG5cbiAgLyoqIEFuIG9wdGlvbmFsIGBpZGAgd2hpY2ggd2lsbCBiZSBzZW50IHdpdGggdGhlIGV2ZW50IGFuZCBleHBvc2VkIGluIHRoZVxuICAgKiBjbGllbnQgYEV2ZW50U291cmNlYC4gKi9cbiAgaWQ/OiBudW1iZXI7XG5cbiAgLyoqIFRoZSByZXBsYWNlciBpcyBwYXNzZWQgdG8gYEpTT04uc3RyaW5naWZ5YCB3aGVuIGNvbnZlcnRpbmcgdGhlIGBkYXRhYFxuICAgKiBwcm9wZXJ0eSB0byBhIEpTT04gc3RyaW5nLiAqL1xuICByZXBsYWNlcj86XG4gICAgfCAoc3RyaW5nIHwgbnVtYmVyKVtdXG4gICAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgICB8ICgodGhpczogYW55LCBrZXk6IHN0cmluZywgdmFsdWU6IGFueSkgPT4gYW55KTtcblxuICAvKiogU3BhY2UgaXMgcGFzc2VkIHRvIGBKU09OLnN0cmluZ2lmeWAgd2hlbiBjb252ZXJ0aW5nIHRoZSBgZGF0YWAgcHJvcGVydHlcbiAgICogdG8gYSBKU09OIHN0cmluZy4gKi9cbiAgc3BhY2U/OiBzdHJpbmcgfCBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VydmVyU2VudEV2ZW50VGFyZ2V0T3B0aW9ucyB7XG4gIC8qKiBLZWVwIGNsaWVudCBjb25uZWN0aW9ucyBhbGl2ZSBieSBzZW5kaW5nIGEgY29tbWVudCBldmVudCB0byB0aGUgY2xpZW50XG4gICAqIGF0IGEgc3BlY2lmaWVkIGludGVydmFsLiAgSWYgYHRydWVgLCB0aGVuIGl0IHBvbGxzIGV2ZXJ5IDMwMDAwIG1pbGxpc2Vjb25kc1xuICAgKiAoMzAgc2Vjb25kcykuIElmIHNldCB0byBhIG51bWJlciwgdGhlbiBpdCBwb2xscyB0aGF0IG51bWJlciBvZlxuICAgKiBtaWxsaXNlY29uZHMuICBUaGUgZmVhdHVyZSBpcyBkaXNhYmxlZCBpZiBzZXQgdG8gYGZhbHNlYC4gIEl0IGRlZmF1bHRzIHRvXG4gICAqIGBmYWxzZWAuICovXG4gIGtlZXBBbGl2ZT86IGJvb2xlYW4gfCBudW1iZXI7XG59XG5cbmNsYXNzIENsb3NlRXZlbnQgZXh0ZW5kcyBFdmVudCB7XG4gIGNvbnN0cnVjdG9yKGV2ZW50SW5pdDogRXZlbnRJbml0KSB7XG4gICAgc3VwZXIoXCJjbG9zZVwiLCBldmVudEluaXQpO1xuICB9XG59XG5cbi8qKiBBbiBldmVudCB3aGljaCBjb250YWlucyBpbmZvcm1hdGlvbiB3aGljaCB3aWxsIGJlIHNlbnQgdG8gdGhlIHJlbW90ZVxuICogY29ubmVjdGlvbiBhbmQgYmUgbWFkZSBhdmFpbGFibGUgaW4gYW4gYEV2ZW50U291cmNlYCBhcyBhbiBldmVudC4gQSBzZXJ2ZXJcbiAqIGNyZWF0ZXMgbmV3IGV2ZW50cyBhbmQgZGlzcGF0Y2hlcyB0aGVtIG9uIHRoZSB0YXJnZXQgd2hpY2ggd2lsbCB0aGVuIGJlXG4gKiBzZW50IHRvIGEgY2xpZW50LlxuICpcbiAqIFNlZSBtb3JlIGFib3V0IFNlcnZlci1zZW50IGV2ZW50cyBvbiBbTUROXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvU2VydmVyLXNlbnRfZXZlbnRzL1VzaW5nX3NlcnZlci1zZW50X2V2ZW50cylcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQge1xuICogICBTZXJ2ZXJTZW50RXZlbnQsXG4gKiAgIFNlcnZlclNlbnRFdmVudFN0cmVhbVRhcmdldCxcbiAqIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vaHR0cC9zZXJ2ZXJfc2VudF9ldmVudC50c1wiO1xuICpcbiAqIERlbm8uc2VydmUoeyBwb3J0OiA4MDAwIH0sIChyZXF1ZXN0KSA9PiB7XG4gKiAgIGNvbnN0IHRhcmdldCA9IG5ldyBTZXJ2ZXJTZW50RXZlbnRTdHJlYW1UYXJnZXQoKTtcbiAqICAgY29uc3QgZXZ0ID0gbmV3IFNlcnZlclNlbnRFdmVudChcIm1lc3NhZ2VcIiwge1xuICogICAgIGRhdGE6IHsgaGVsbG86IFwid29ybGRcIiB9LFxuICogICAgIGlkOiAxXG4gKiAgIH0pO1xuICogICB0YXJnZXQuZGlzcGF0Y2hFdmVudChldnQpO1xuICogICByZXR1cm4gdGFyZ2V0LmFzUmVzcG9uc2UoKTtcbiAqIH0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBTZXJ2ZXJTZW50RXZlbnQgZXh0ZW5kcyBFdmVudCB7XG4gICNkYXRhOiBzdHJpbmc7XG4gICNpZD86IG51bWJlcjtcbiAgI3R5cGU6IHN0cmluZztcblxuICAvKipcbiAgICogQHBhcmFtIHR5cGUgdGhlIGV2ZW50IHR5cGUgdGhhdCB3aWxsIGJlIGF2YWlsYWJsZSBvbiB0aGUgY2xpZW50LiBUaGUgdHlwZVxuICAgKiAgICAgICAgICAgICBvZiBgXCJtZXNzYWdlXCJgIHdpbGwgYmUgaGFuZGxlZCBzcGVjaWZpY2FsbHkgYXMgYSBtZXNzYWdlXG4gICAqICAgICAgICAgICAgIHNlcnZlci1zaWRlIGV2ZW50LlxuICAgKiBAcGFyYW0gZXZlbnRJbml0IGluaXRpYWxpemF0aW9uIG9wdGlvbnMgZm9yIHRoZSBldmVudFxuICAgKi9cbiAgY29uc3RydWN0b3IodHlwZTogc3RyaW5nLCBldmVudEluaXQ6IFNlcnZlclNlbnRFdmVudEluaXQgPSB7fSkge1xuICAgIHN1cGVyKHR5cGUsIGV2ZW50SW5pdCk7XG4gICAgY29uc3QgeyBkYXRhLCByZXBsYWNlciwgc3BhY2UgfSA9IGV2ZW50SW5pdDtcbiAgICB0aGlzLiN0eXBlID0gdHlwZTtcbiAgICB0cnkge1xuICAgICAgdGhpcy4jZGF0YSA9IHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiXG4gICAgICAgID8gZGF0YVxuICAgICAgICA6IGRhdGEgIT09IHVuZGVmaW5lZFxuICAgICAgICA/IEpTT04uc3RyaW5naWZ5KGRhdGEsIHJlcGxhY2VyIGFzIChzdHJpbmcgfCBudW1iZXIpW10sIHNwYWNlKVxuICAgICAgICA6IFwiXCI7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgYXNzZXJ0KGUgaW5zdGFuY2VvZiBFcnJvcik7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICBgZGF0YSBjb3VsZCBub3QgYmUgY29lcmNlZCBpbnRvIGEgc2VyaWFsaXplZCBzdHJpbmcuXFxuICAke2UubWVzc2FnZX1gLFxuICAgICAgKTtcbiAgICB9XG4gICAgY29uc3QgeyBpZCB9ID0gZXZlbnRJbml0O1xuICAgIHRoaXMuI2lkID0gaWQ7XG4gIH1cblxuICAvKiogVGhlIGRhdGEgYXNzb2NpYXRlZCB3aXRoIHRoZSBldmVudCwgd2hpY2ggd2lsbCBiZSBzZW50IHRvIHRoZSBjbGllbnQgYW5kXG4gICAqIGJlIG1hZGUgYXZhaWxhYmxlIGluIHRoZSBgRXZlbnRTb3VyY2VgLiAqL1xuICBnZXQgZGF0YSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLiNkYXRhO1xuICB9XG5cbiAgLyoqIFRoZSBvcHRpb25hbCBJRCBhc3NvY2lhdGVkIHdpdGggdGhlIGV2ZW50IHRoYXQgd2lsbCBiZSBzZW50IHRvIHRoZSBjbGllbnRcbiAgICogYW5kIGJlIG1hZGUgYXZhaWxhYmxlIGluIHRoZSBgRXZlbnRTb3VyY2VgLiAqL1xuICBnZXQgaWQoKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy4jaWQ7XG4gIH1cblxuICBvdmVycmlkZSB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIGNvbnN0IGRhdGEgPSBgZGF0YTogJHt0aGlzLiNkYXRhLnNwbGl0KFwiXFxuXCIpLmpvaW4oXCJcXG5kYXRhOiBcIil9XFxuYDtcbiAgICByZXR1cm4gYCR7dGhpcy4jdHlwZSA9PT0gXCJfX21lc3NhZ2VcIiA/IFwiXCIgOiBgZXZlbnQ6ICR7dGhpcy4jdHlwZX1cXG5gfSR7XG4gICAgICB0aGlzLiNpZCA/IGBpZDogJHtTdHJpbmcodGhpcy4jaWQpfVxcbmAgOiBcIlwiXG4gICAgfSR7ZGF0YX1cXG5gO1xuICB9XG59XG5cbmNvbnN0IFJFU1BPTlNFX0hFQURFUlMgPSBbXG4gIFtcIkNvbm5lY3Rpb25cIiwgXCJLZWVwLUFsaXZlXCJdLFxuICBbXCJDb250ZW50LVR5cGVcIiwgXCJ0ZXh0L2V2ZW50LXN0cmVhbVwiXSxcbiAgW1wiQ2FjaGUtQ29udHJvbFwiLCBcIm5vLWNhY2hlXCJdLFxuICBbXCJLZWVwLUFsaXZlXCIsIGB0aW1lb3V0PSR7TnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJ9YF0sXG5dIGFzIGNvbnN0O1xuXG5leHBvcnQgaW50ZXJmYWNlIFNlcnZlclNlbnRFdmVudFRhcmdldCBleHRlbmRzIEV2ZW50VGFyZ2V0IHtcbiAgLyoqIElzIHNldCB0byBgdHJ1ZWAgaWYgZXZlbnRzIGNhbm5vdCBiZSBzZW50IHRvIHRoZSByZW1vdGUgY29ubmVjdGlvbi5cbiAgICogT3RoZXJ3aXNlIGl0IGlzIHNldCB0byBgZmFsc2VgLlxuICAgKlxuICAgKiAqTm90ZSo6IFRoaXMgZmxhZyBpcyBsYXppbHkgc2V0LCBhbmQgbWlnaHQgbm90IHJlZmxlY3QgYSBjbG9zZWQgc3RhdGUgdW50aWxcbiAgICogYW5vdGhlciBldmVudCwgY29tbWVudCBvciBtZXNzYWdlIGlzIGF0dGVtcHRlZCB0byBiZSBwcm9jZXNzZWQuICovXG4gIHJlYWRvbmx5IGNsb3NlZDogYm9vbGVhbjtcblxuICAvKiogQ2xvc2UgdGhlIHRhcmdldCwgcmVmdXNpbmcgdG8gYWNjZXB0IGFueSBtb3JlIGV2ZW50cy4gKi9cbiAgY2xvc2UoKTogUHJvbWlzZTx2b2lkPjtcblxuICAvKiogU2VuZCBhIGNvbW1lbnQgdG8gdGhlIHJlbW90ZSBjb25uZWN0aW9uLiAgQ29tbWVudHMgYXJlIG5vdCBleHBvc2VkIHRvIHRoZVxuICAgKiBjbGllbnQgYEV2ZW50U291cmNlYCBidXQgYXJlIHVzZWQgZm9yIGRpYWdub3N0aWNzIGFuZCBoZWxwaW5nIGVuc3VyZSBhXG4gICAqIGNvbm5lY3Rpb24gaXMga2VwdCBhbGl2ZS5cbiAgICpcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHsgU2VydmVyU2VudEV2ZW50U3RyZWFtVGFyZ2V0IH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vaHR0cC9zZXJ2ZXJfc2VudF9ldmVudC50c1wiO1xuICAgKlxuICAgKiBEZW5vLnNlcnZlKHsgcG9ydDogODAwMCB9LCAocmVxdWVzdCkgPT4ge1xuICAgKiAgIGNvbnN0IHRhcmdldCA9IG5ldyBTZXJ2ZXJTZW50RXZlbnRTdHJlYW1UYXJnZXQoKTtcbiAgICogICB0YXJnZXQuZGlzcGF0Y2hDb21tZW50KFwidGhpcyBpcyBhIGNvbW1lbnRcIik7XG4gICAqICAgcmV0dXJuIHRhcmdldC5hc1Jlc3BvbnNlKCk7XG4gICAqIH0pO1xuICAgKiBgYGBcbiAgICovXG4gIGRpc3BhdGNoQ29tbWVudChjb21tZW50OiBzdHJpbmcpOiBib29sZWFuO1xuXG4gIC8qKiBEaXNwYXRjaCBhIG1lc3NhZ2UgdG8gdGhlIGNsaWVudC4gIFRoaXMgbWVzc2FnZSB3aWxsIGNvbnRhaW4gYGRhdGE6IGAgb25seVxuICAgKiBhbmQgYmUgYXZhaWxhYmxlIG9uIHRoZSBjbGllbnQgYEV2ZW50U291cmNlYCBvbiB0aGUgYG9ubWVzc2FnZWAgb3IgYW4gZXZlbnRcbiAgICogbGlzdGVuZXIgb2YgdHlwZSBgXCJtZXNzYWdlXCJgLiAqL1xuICBkaXNwYXRjaE1lc3NhZ2UoZGF0YTogdW5rbm93bik6IGJvb2xlYW47XG5cbiAgLyoqIERpc3BhdGNoIGEgc2VydmVyIHNlbnQgZXZlbnQgdG8gdGhlIGNsaWVudC4gIFRoZSBldmVudCBgdHlwZWAgd2lsbCBiZVxuICAgKiBzZW50IGFzIGBldmVudDogYCB0byB0aGUgY2xpZW50IHdoaWNoIHdpbGwgYmUgcmFpc2VkIGFzIGEgYE1lc3NhZ2VFdmVudGBcbiAgICogb24gdGhlIGBFdmVudFNvdXJjZWAgaW4gdGhlIGNsaWVudC5cbiAgICpcbiAgICogQW55IGxvY2FsIGV2ZW50IGhhbmRsZXJzIHdpbGwgYmUgZGlzcGF0Y2hlZCB0byBmaXJzdCwgYW5kIGlmIHRoZSBldmVudFxuICAgKiBpcyBjYW5jZWxsZWQsIGl0IHdpbGwgbm90IGJlIHNlbnQgdG8gdGhlIGNsaWVudC5cbiAgICpcbiAgICogYGBgdHNcbiAgICogaW1wb3J0IHtcbiAgICogICBTZXJ2ZXJTZW50RXZlbnQsXG4gICAqICAgU2VydmVyU2VudEV2ZW50U3RyZWFtVGFyZ2V0LFxuICAgKiB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2h0dHAvc2VydmVyX3NlbnRfZXZlbnQudHNcIjtcbiAgICpcbiAgICogRGVuby5zZXJ2ZSh7IHBvcnQ6IDgwMDAgfSwgKHJlcXVlc3QpID0+IHtcbiAgICogICBjb25zdCB0YXJnZXQgPSBuZXcgU2VydmVyU2VudEV2ZW50U3RyZWFtVGFyZ2V0KCk7XG4gICAqICAgY29uc3QgZXZ0ID0gbmV3IFNlcnZlclNlbnRFdmVudChcInBpbmdcIiwgeyBkYXRhOiBcImhlbGxvXCIgfSk7XG4gICAqICAgdGFyZ2V0LmRpc3BhdGNoRXZlbnQoZXZ0KTtcbiAgICogICByZXR1cm4gdGFyZ2V0LmFzUmVzcG9uc2UoKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgZGlzcGF0Y2hFdmVudChldmVudDogU2VydmVyU2VudEV2ZW50KTogYm9vbGVhbjtcblxuICAvKiogRGlzcGF0Y2ggYSBzZXJ2ZXIgc2VudCBldmVudCB0byB0aGUgY2xpZW50LiAgVGhlIGV2ZW50IGB0eXBlYCB3aWxsIGJlXG4gICAqIHNlbnQgYXMgYGV2ZW50OiBgIHRvIHRoZSBjbGllbnQgd2hpY2ggd2lsbCBiZSByYWlzZWQgYXMgYSBgTWVzc2FnZUV2ZW50YFxuICAgKiBvbiB0aGUgYEV2ZW50U291cmNlYCBpbiB0aGUgY2xpZW50LlxuICAgKlxuICAgKiBBbnkgbG9jYWwgZXZlbnQgaGFuZGxlcnMgd2lsbCBiZSBkaXNwYXRjaGVkIHRvIGZpcnN0LCBhbmQgaWYgdGhlIGV2ZW50XG4gICAqIGlzIGNhbmNlbGxlZCwgaXQgd2lsbCBub3QgYmUgc2VudCB0byB0aGUgY2xpZW50LlxuICAgKlxuICAgKiBgYGB0c1xuICAgKiBpbXBvcnQge1xuICAgKiAgIFNlcnZlclNlbnRFdmVudCxcbiAgICogICBTZXJ2ZXJTZW50RXZlbnRTdHJlYW1UYXJnZXQsXG4gICAqIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vaHR0cC9zZXJ2ZXJfc2VudF9ldmVudC50c1wiO1xuICAgKlxuICAgKiBEZW5vLnNlcnZlKHsgcG9ydDogODAwMCB9LCAocmVxdWVzdCkgPT4ge1xuICAgKiAgIGNvbnN0IHRhcmdldCA9IG5ldyBTZXJ2ZXJTZW50RXZlbnRTdHJlYW1UYXJnZXQoKTtcbiAgICogICBjb25zdCBldnQgPSBuZXcgU2VydmVyU2VudEV2ZW50KFwicGluZ1wiLCB7IGRhdGE6IFwiaGVsbG9cIiB9KTtcbiAgICogICB0YXJnZXQuZGlzcGF0Y2hFdmVudChldnQpO1xuICAgKiAgIHJldHVybiB0YXJnZXQuYXNSZXNwb25zZSgpO1xuICAgKiB9KTtcbiAgICogYGBgXG4gICAqL1xuICBkaXNwYXRjaEV2ZW50KGV2ZW50OiBDbG9zZUV2ZW50IHwgRXJyb3JFdmVudCk6IGJvb2xlYW47XG59XG5cbi8qKiBBbiBpbXBsZW1lbnRhdGlvbiBvZiB7QGxpbmtjb2RlIFNlcnZlclNlbnRFdmVudFRhcmdldH0gdGhhdCBwcm92aWRlcyBhXG4gKiByZWFkYWJsZSBzdHJlYW0gYXMgYSBib2R5IG9mIGEgcmVzcG9uc2UgdG8gZXN0YWJsaXNoIGEgY29ubmVjdGlvbiB0byBhXG4gKiBjbGllbnQuICovXG5leHBvcnQgY2xhc3MgU2VydmVyU2VudEV2ZW50U3RyZWFtVGFyZ2V0IGV4dGVuZHMgRXZlbnRUYXJnZXRcbiAgaW1wbGVtZW50cyBTZXJ2ZXJTZW50RXZlbnRUYXJnZXQge1xuICAjYm9keUluaXQ6IFJlYWRhYmxlU3RyZWFtPFVpbnQ4QXJyYXk+O1xuICAjY2xvc2VkID0gZmFsc2U7XG4gICNjb250cm9sbGVyPzogUmVhZGFibGVTdHJlYW1EZWZhdWx0Q29udHJvbGxlcjxVaW50OEFycmF5PjtcbiAgLy8gd2UgYXJlIGlnbm9yaW5nIGFueSBoZXJlLCBiZWNhdXNlIHdoZW4gZXhwb3J0aW5nIHRvIG5wbS9Ob2RlLmpzLCB0aGUgdGltZXJcbiAgLy8gaGFuZGxlIGlzbid0IGEgbnVtYmVyLlxuICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICAja2VlcEFsaXZlSWQ/OiBhbnk7XG5cbiAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgI2Vycm9yKGVycm9yOiBhbnkpIHtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IENsb3NlRXZlbnQoeyBjYW5jZWxhYmxlOiBmYWxzZSB9KSk7XG4gICAgY29uc3QgZXJyb3JFdmVudCA9IG5ldyBFcnJvckV2ZW50KFwiZXJyb3JcIiwgeyBlcnJvciB9KTtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXJyb3JFdmVudCk7XG4gIH1cblxuICAjcHVzaChwYXlsb2FkOiBzdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMuI2NvbnRyb2xsZXIpIHtcbiAgICAgIHRoaXMuI2Vycm9yKG5ldyBFcnJvcihcIlRoZSBjb250cm9sbGVyIGhhcyBub3QgYmVlbiBzZXQuXCIpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuI2Nsb3NlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLiNjb250cm9sbGVyLmVucXVldWUoZW5jb2Rlci5lbmNvZGUocGF5bG9hZCkpO1xuICB9XG5cbiAgZ2V0IGNsb3NlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy4jY2xvc2VkO1xuICB9XG5cbiAgY29uc3RydWN0b3IoeyBrZWVwQWxpdmUgPSBmYWxzZSB9OiBTZXJ2ZXJTZW50RXZlbnRUYXJnZXRPcHRpb25zID0ge30pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy4jYm9keUluaXQgPSBuZXcgUmVhZGFibGVTdHJlYW08VWludDhBcnJheT4oe1xuICAgICAgc3RhcnQ6IChjb250cm9sbGVyKSA9PiB7XG4gICAgICAgIHRoaXMuI2NvbnRyb2xsZXIgPSBjb250cm9sbGVyO1xuICAgICAgfSxcbiAgICAgIGNhbmNlbDogKGVycm9yKSA9PiB7XG4gICAgICAgIC8vIGNvbm5lY3Rpb25zIGNsb3NpbmcgYXJlIGNvbnNpZGVyZWQgXCJub3JtYWxcIiBmb3IgU1NFIGV2ZW50cyBhbmQganVzdFxuICAgICAgICAvLyBtZWFuIHRoZSBmYXIgc2lkZSBoYXMgY2xvc2VkLlxuICAgICAgICBpZiAoXG4gICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnJvci5tZXNzYWdlLmluY2x1ZGVzKFwiY29ubmVjdGlvbiBjbG9zZWRcIilcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuI2Vycm9yKGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImNsb3NlXCIsICgpID0+IHtcbiAgICAgIHRoaXMuI2Nsb3NlZCA9IHRydWU7XG4gICAgICBpZiAodGhpcy4ja2VlcEFsaXZlSWQgIT0gbnVsbCkge1xuICAgICAgICBjbGVhckludGVydmFsKHRoaXMuI2tlZXBBbGl2ZUlkKTtcbiAgICAgICAgdGhpcy4ja2VlcEFsaXZlSWQgPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy4jY29udHJvbGxlcikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuI2NvbnRyb2xsZXIuY2xvc2UoKTtcbiAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgLy8gd2UgaWdub3JlIGFueSBlcnJvcnMgaGVyZSwgYXMgaXQgaXMgbGlrZWx5IHRoYXQgdGhlIGNvbnRyb2xsZXJcbiAgICAgICAgICAvLyBpcyBhbHJlYWR5IGNsb3NlZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoa2VlcEFsaXZlKSB7XG4gICAgICBjb25zdCBpbnRlcnZhbCA9IHR5cGVvZiBrZWVwQWxpdmUgPT09IFwibnVtYmVyXCJcbiAgICAgICAgPyBrZWVwQWxpdmVcbiAgICAgICAgOiBERUZBVUxUX0tFRVBfQUxJVkVfSU5URVJWQUw7XG4gICAgICB0aGlzLiNrZWVwQWxpdmVJZCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaENvbW1lbnQoXCJrZWVwLWFsaXZlIGNvbW1lbnRcIik7XG4gICAgICB9LCBpbnRlcnZhbCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHVybnMgYSB7QGxpbmtjb2RlIFJlc3BvbnNlfSB3aGljaCBjb250YWlucyB0aGUgYm9keSBhbmQgaGVhZGVycyBuZWVkZWRcbiAgICogdG8gaW5pdGlhdGUgYSBTU0UgY29ubmVjdGlvbiB3aXRoIHRoZSBjbGllbnQuICovXG4gIGFzUmVzcG9uc2UocmVzcG9uc2VJbml0PzogUmVzcG9uc2VJbml0KTogUmVzcG9uc2Uge1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoLi4udGhpcy5hc1Jlc3BvbnNlSW5pdChyZXNwb25zZUluaXQpKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIGEgdHVwbGUgd2hpY2ggY29udGFpbnMgdGhlIHtAbGlua2NvZGUgQm9keUluaXR9IGFuZFxuICAgKiB7QGxpbmtjb2RlIFJlc3BvbnNlSW5pdH0gbmVlZGVkIHRvIGNyZWF0ZSBhIHJlc3BvbnNlIHRoYXQgd2lsbCBlc3RhYmxpc2hcbiAgICogYSBTU0UgY29ubmVjdGlvbiB3aXRoIHRoZSBjbGllbnQuICovXG4gIGFzUmVzcG9uc2VJbml0KHJlc3BvbnNlSW5pdDogUmVzcG9uc2VJbml0ID0ge30pOiBbQm9keUluaXQsIFJlc3BvbnNlSW5pdF0ge1xuICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgSGVhZGVycyhyZXNwb25zZUluaXQuaGVhZGVycyk7XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgUkVTUE9OU0VfSEVBREVSUykge1xuICAgICAgaGVhZGVycy5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICAgIHJlc3BvbnNlSW5pdC5oZWFkZXJzID0gaGVhZGVycztcbiAgICByZXR1cm4gW3RoaXMuI2JvZHlJbml0LCByZXNwb25zZUluaXRdO1xuICB9XG5cbiAgY2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDbG9zZUV2ZW50KHsgY2FuY2VsYWJsZTogZmFsc2UgfSkpO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIGRpc3BhdGNoQ29tbWVudChjb21tZW50OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB0aGlzLiNwdXNoKGA6ICR7Y29tbWVudC5zcGxpdChcIlxcblwiKS5qb2luKFwiXFxuOiBcIil9XFxuXFxuYCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICBkaXNwYXRjaE1lc3NhZ2UoZGF0YTogYW55KTogYm9vbGVhbiB7XG4gICAgY29uc3QgZXZlbnQgPSBuZXcgU2VydmVyU2VudEV2ZW50KFwiX19tZXNzYWdlXCIsIHsgZGF0YSB9KTtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgfVxuXG4gIG92ZXJyaWRlIGRpc3BhdGNoRXZlbnQoZXZlbnQ6IFNlcnZlclNlbnRFdmVudCk6IGJvb2xlYW47XG4gIG92ZXJyaWRlIGRpc3BhdGNoRXZlbnQoZXZlbnQ6IENsb3NlRXZlbnQgfCBFcnJvckV2ZW50KTogYm9vbGVhbjtcbiAgb3ZlcnJpZGUgZGlzcGF0Y2hFdmVudChcbiAgICBldmVudDogU2VydmVyU2VudEV2ZW50IHwgQ2xvc2VFdmVudCB8IEVycm9yRXZlbnQsXG4gICk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGRpc3BhdGNoZWQgPSBzdXBlci5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICBpZiAoZGlzcGF0Y2hlZCAmJiBldmVudCBpbnN0YW5jZW9mIFNlcnZlclNlbnRFdmVudCkge1xuICAgICAgdGhpcy4jcHVzaChTdHJpbmcoZXZlbnQpKTtcbiAgICB9XG4gICAgcmV0dXJuIGRpc3BhdGNoZWQ7XG4gIH1cblxuICBbU3ltYm9sLmZvcihcIkRlbm8uY3VzdG9tSW5zcGVjdFwiKV0oaW5zcGVjdDogKHZhbHVlOiB1bmtub3duKSA9PiBzdHJpbmcpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSAke1xuICAgICAgaW5zcGVjdCh7IFwiI2JvZHlJbml0XCI6IHRoaXMuI2JvZHlJbml0LCBcIiNjbG9zZWRcIjogdGhpcy4jY2xvc2VkIH0pXG4gICAgfWA7XG4gIH1cblxuICBbU3ltYm9sLmZvcihcIm5vZGVqcy51dGlsLmluc3BlY3QuY3VzdG9tXCIpXShcbiAgICBkZXB0aDogbnVtYmVyLFxuICAgIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gICAgb3B0aW9uczogYW55LFxuICAgIGluc3BlY3Q6ICh2YWx1ZTogdW5rbm93biwgb3B0aW9ucz86IHVua25vd24pID0+IHN0cmluZyxcbiAgKSB7XG4gICAgaWYgKGRlcHRoIDwgMCkge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuc3R5bGl6ZShgWyR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfV1gLCBcInNwZWNpYWxcIik7XG4gICAgfVxuXG4gICAgY29uc3QgbmV3T3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIG9wdGlvbnMsIHtcbiAgICAgIGRlcHRoOiBvcHRpb25zLmRlcHRoID09PSBudWxsID8gbnVsbCA6IG9wdGlvbnMuZGVwdGggLSAxLFxuICAgIH0pO1xuICAgIHJldHVybiBgJHtvcHRpb25zLnN0eWxpemUodGhpcy5jb25zdHJ1Y3Rvci5uYW1lLCBcInNwZWNpYWxcIil9ICR7XG4gICAgICBpbnNwZWN0KFxuICAgICAgICB7IFwiI2JvZHlJbml0XCI6IHRoaXMuI2JvZHlJbml0LCBcIiNjbG9zZWRcIjogdGhpcy4jY2xvc2VkIH0sXG4gICAgICAgIG5ld09wdGlvbnMsXG4gICAgICApXG4gICAgfWA7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBd0NDLEdBRUQsU0FBUyxNQUFNLFFBQVEsc0JBQXNCO0FBRTdDLE1BQU0sVUFBVSxJQUFJO0FBRXBCLE1BQU0sOEJBQThCO0FBaUNwQyxNQUFNLG1CQUFtQjtJQUN2QixZQUFZLFNBQW9CLENBQUU7UUFDaEMsS0FBSyxDQUFDLFNBQVM7SUFDakI7QUFDRjtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBeUJDLEdBQ0QsT0FBTyxNQUFNLHdCQUF3QjtJQUNuQyxDQUFDLElBQUksQ0FBUztJQUNkLENBQUMsRUFBRSxDQUFVO0lBQ2IsQ0FBQyxJQUFJLENBQVM7SUFFZDs7Ozs7R0FLQyxHQUNELFlBQVksSUFBWSxFQUFFLFlBQWlDLENBQUMsQ0FBQyxDQUFFO1FBQzdELEtBQUssQ0FBQyxNQUFNO1FBQ1osTUFBTSxFQUFFLEtBQUksRUFBRSxTQUFRLEVBQUUsTUFBSyxFQUFFLEdBQUc7UUFDbEMsSUFBSSxDQUFDLENBQUMsSUFBSSxHQUFHO1FBQ2IsSUFBSTtZQUNGLElBQUksQ0FBQyxDQUFDLElBQUksR0FBRyxPQUFPLFNBQVMsV0FDekIsT0FDQSxTQUFTLFlBQ1QsS0FBSyxTQUFTLENBQUMsTUFBTSxVQUFpQyxTQUN0RCxFQUFFO1FBQ1IsRUFBRSxPQUFPLEdBQUc7WUFDVixPQUFPLGFBQWE7WUFDcEIsTUFBTSxJQUFJLFVBQ1IsQ0FBQyx1REFBdUQsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQ3JFO1FBQ0o7UUFDQSxNQUFNLEVBQUUsR0FBRSxFQUFFLEdBQUc7UUFDZixJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUc7SUFDYjtJQUVBOzZDQUMyQyxHQUMzQyxJQUFJLE9BQWU7UUFDakIsT0FBTyxJQUFJLENBQUMsQ0FBQyxJQUFJO0lBQ25CO0lBRUE7aURBQytDLEdBQy9DLElBQUksS0FBeUI7UUFDM0IsT0FBTyxJQUFJLENBQUMsQ0FBQyxFQUFFO0lBQ2pCO0lBRVMsV0FBbUI7UUFDMUIsTUFBTSxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDakUsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLGNBQWMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDbkUsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FDNUMsRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUNiO0FBQ0YsQ0FBQztBQUVELE1BQU0sbUJBQW1CO0lBQ3ZCO1FBQUM7UUFBYztLQUFhO0lBQzVCO1FBQUM7UUFBZ0I7S0FBb0I7SUFDckM7UUFBQztRQUFpQjtLQUFXO0lBQzdCO1FBQUM7UUFBYyxDQUFDLFFBQVEsRUFBRSxPQUFPLGdCQUFnQixDQUFDLENBQUM7S0FBQztDQUNyRDtBQWlGRDs7V0FFVyxHQUNYLE9BQU8sTUFBTSxvQ0FBb0M7SUFFL0MsQ0FBQyxRQUFRLENBQTZCO0lBQ3RDLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUNoQixDQUFDLFVBQVUsQ0FBK0M7SUFDMUQsNkVBQTZFO0lBQzdFLHlCQUF5QjtJQUN6QixtQ0FBbUM7SUFDbkMsQ0FBQyxXQUFXLENBQU87SUFFbkIsbUNBQW1DO0lBQ25DLENBQUMsS0FBSyxDQUFDLEtBQVUsRUFBRTtRQUNqQixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksV0FBVztZQUFFLFlBQVksS0FBSztRQUFDO1FBQ3RELE1BQU0sYUFBYSxJQUFJLFdBQVcsU0FBUztZQUFFO1FBQU07UUFDbkQsSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUNyQjtJQUVBLENBQUMsSUFBSSxDQUFDLE9BQWUsRUFBRTtRQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxFQUFFO1lBQ3JCLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLE1BQU07WUFDdEI7UUFDRixDQUFDO1FBQ0QsSUFBSSxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUU7WUFDaEI7UUFDRixDQUFDO1FBQ0QsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxRQUFRLE1BQU0sQ0FBQztJQUMxQztJQUVBLElBQUksU0FBa0I7UUFDcEIsT0FBTyxJQUFJLENBQUMsQ0FBQyxNQUFNO0lBQ3JCO0lBRUEsWUFBWSxFQUFFLFdBQVksS0FBSyxDQUFBLEVBQWdDLEdBQUcsQ0FBQyxDQUFDLENBQUU7UUFDcEUsS0FBSztRQUVMLElBQUksQ0FBQyxDQUFDLFFBQVEsR0FBRyxJQUFJLGVBQTJCO1lBQzlDLE9BQU8sQ0FBQyxhQUFlO2dCQUNyQixJQUFJLENBQUMsQ0FBQyxVQUFVLEdBQUc7WUFDckI7WUFDQSxRQUFRLENBQUMsUUFBVTtnQkFDakIsc0VBQXNFO2dCQUN0RSxnQ0FBZ0M7Z0JBQ2hDLElBQ0UsaUJBQWlCLFNBQVMsTUFBTSxPQUFPLENBQUMsUUFBUSxDQUFDLHNCQUNqRDtvQkFDQSxJQUFJLENBQUMsS0FBSztnQkFDWixPQUFPO29CQUNMLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQztnQkFDZCxDQUFDO1lBQ0g7UUFDRjtRQUVBLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLElBQU07WUFDbkMsSUFBSSxDQUFDLENBQUMsTUFBTSxHQUFHLElBQUk7WUFDbkIsSUFBSSxJQUFJLENBQUMsQ0FBQyxXQUFXLElBQUksSUFBSSxFQUFFO2dCQUM3QixjQUFjLElBQUksQ0FBQyxDQUFDLFdBQVc7Z0JBQy9CLElBQUksQ0FBQyxDQUFDLFdBQVcsR0FBRztZQUN0QixDQUFDO1lBQ0QsSUFBSSxJQUFJLENBQUMsQ0FBQyxVQUFVLEVBQUU7Z0JBQ3BCLElBQUk7b0JBQ0YsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUs7Z0JBQ3hCLEVBQUUsT0FBTTtnQkFDTixpRUFBaUU7Z0JBQ2pFLG9CQUFvQjtnQkFDdEI7WUFDRixDQUFDO1FBQ0g7UUFFQSxJQUFJLFdBQVc7WUFDYixNQUFNLFdBQVcsT0FBTyxjQUFjLFdBQ2xDLFlBQ0EsMkJBQTJCO1lBQy9CLElBQUksQ0FBQyxDQUFDLFdBQVcsR0FBRyxZQUFZLElBQU07Z0JBQ3BDLElBQUksQ0FBQyxlQUFlLENBQUM7WUFDdkIsR0FBRztRQUNMLENBQUM7SUFDSDtJQUVBO21EQUNpRCxHQUNqRCxXQUFXLFlBQTJCLEVBQVk7UUFDaEQsT0FBTyxJQUFJLFlBQVksSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUM3QztJQUVBOzt1Q0FFcUMsR0FDckMsZUFBZSxlQUE2QixDQUFDLENBQUMsRUFBNEI7UUFDeEUsTUFBTSxVQUFVLElBQUksUUFBUSxhQUFhLE9BQU87UUFDaEQsS0FBSyxNQUFNLENBQUMsS0FBSyxNQUFNLElBQUksaUJBQWtCO1lBQzNDLFFBQVEsR0FBRyxDQUFDLEtBQUs7UUFDbkI7UUFDQSxhQUFhLE9BQU8sR0FBRztRQUN2QixPQUFPO1lBQUMsSUFBSSxDQUFDLENBQUMsUUFBUTtZQUFFO1NBQWE7SUFDdkM7SUFFQSxRQUF1QjtRQUNyQixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksV0FBVztZQUFFLFlBQVksS0FBSztRQUFDO1FBQ3RELE9BQU8sUUFBUSxPQUFPO0lBQ3hCO0lBRUEsZ0JBQWdCLE9BQWUsRUFBVztRQUN4QyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsUUFBUSxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUM7UUFDdEQsT0FBTyxJQUFJO0lBQ2I7SUFFQSxtQ0FBbUM7SUFDbkMsZ0JBQWdCLElBQVMsRUFBVztRQUNsQyxNQUFNLFFBQVEsSUFBSSxnQkFBZ0IsYUFBYTtZQUFFO1FBQUs7UUFDdEQsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzVCO0lBSVMsY0FDUCxLQUFnRCxFQUN2QztRQUNULE1BQU0sYUFBYSxLQUFLLENBQUMsYUFBYSxDQUFDO1FBQ3ZDLElBQUksY0FBYyxpQkFBaUIsaUJBQWlCO1lBQ2xELElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPO1FBQ3BCLENBQUM7UUFDRCxPQUFPO0lBQ1Q7SUFFQSxDQUFDLE9BQU8sR0FBRyxDQUFDLHNCQUFzQixDQUFDLE9BQW1DLEVBQUU7UUFDdEUsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUMvQixRQUFRO1lBQUUsYUFBYSxJQUFJLENBQUMsQ0FBQyxRQUFRO1lBQUUsV0FBVyxJQUFJLENBQUMsQ0FBQyxNQUFNO1FBQUMsR0FDaEUsQ0FBQztJQUNKO0lBRUEsQ0FBQyxPQUFPLEdBQUcsQ0FBQyw4QkFBOEIsQ0FDeEMsS0FBYSxFQUNiLG1DQUFtQztJQUNuQyxPQUFZLEVBQ1osT0FBc0QsRUFDdEQ7UUFDQSxJQUFJLFFBQVEsR0FBRztZQUNiLE9BQU8sUUFBUSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDdkQsQ0FBQztRQUVELE1BQU0sYUFBYSxPQUFPLE1BQU0sQ0FBQyxDQUFDLEdBQUcsU0FBUztZQUM1QyxPQUFPLFFBQVEsS0FBSyxLQUFLLElBQUksR0FBRyxJQUFJLEdBQUcsUUFBUSxLQUFLLEdBQUcsQ0FBQztRQUMxRDtRQUNBLE9BQU8sQ0FBQyxFQUFFLFFBQVEsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxFQUMzRCxRQUNFO1lBQUUsYUFBYSxJQUFJLENBQUMsQ0FBQyxRQUFRO1lBQUUsV0FBVyxJQUFJLENBQUMsQ0FBQyxNQUFNO1FBQUMsR0FDdkQsWUFFSCxDQUFDO0lBQ0o7QUFDRixDQUFDIn0=