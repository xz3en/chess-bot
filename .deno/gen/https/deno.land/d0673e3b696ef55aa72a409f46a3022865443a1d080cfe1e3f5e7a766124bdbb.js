// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// Copyright the Browserify authors. MIT License.
// Ported from https://github.com/browserify/path-browserify/
// This module is browser compatible.
import { CHAR_BACKWARD_SLASH, CHAR_DOT, CHAR_FORWARD_SLASH, CHAR_LOWERCASE_A, CHAR_LOWERCASE_Z, CHAR_UPPERCASE_A, CHAR_UPPERCASE_Z } from "./_constants.ts";
export function assertPath(path) {
    if (typeof path !== "string") {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path)}`);
    }
}
export function isPosixPathSeparator(code) {
    return code === CHAR_FORWARD_SLASH;
}
export function isPathSeparator(code) {
    return isPosixPathSeparator(code) || code === CHAR_BACKWARD_SLASH;
}
export function isWindowsDeviceRoot(code) {
    return code >= CHAR_LOWERCASE_A && code <= CHAR_LOWERCASE_Z || code >= CHAR_UPPERCASE_A && code <= CHAR_UPPERCASE_Z;
}
// Resolves . and .. elements in a path with directory names
export function normalizeString(path, allowAboveRoot, separator, isPathSeparator) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code;
    for(let i = 0, len = path.length; i <= len; ++i){
        if (i < len) code = path.charCodeAt(i);
        else if (isPathSeparator(code)) break;
        else code = CHAR_FORWARD_SLASH;
        if (isPathSeparator(code)) {
            if (lastSlash === i - 1 || dots === 1) {
            // NOOP
            } else if (lastSlash !== i - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== CHAR_DOT || res.charCodeAt(res.length - 2) !== CHAR_DOT) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex === -1) {
                            res = "";
                            lastSegmentLength = 0;
                        } else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                        }
                        lastSlash = i;
                        dots = 0;
                        continue;
                    } else if (res.length === 2 || res.length === 1) {
                        res = "";
                        lastSegmentLength = 0;
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) res += `${separator}..`;
                    else res = "..";
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0) res += separator + path.slice(lastSlash + 1, i);
                else res = path.slice(lastSlash + 1, i);
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
        } else if (code === CHAR_DOT && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}
export function stripTrailingSeparators(segment, isSep) {
    if (segment.length <= 1) {
        return segment;
    }
    let end = segment.length;
    for(let i = segment.length - 1; i > 0; i--){
        if (isSep(segment.charCodeAt(i))) {
            end = i;
        } else {
            break;
        }
    }
    return segment.slice(0, end);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIwMC4wL3BhdGgvX3V0aWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMyB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCB0aGUgQnJvd3NlcmlmeSBhdXRob3JzLiBNSVQgTGljZW5zZS5cbi8vIFBvcnRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9icm93c2VyaWZ5L3BhdGgtYnJvd3NlcmlmeS9cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHtcbiAgQ0hBUl9CQUNLV0FSRF9TTEFTSCxcbiAgQ0hBUl9ET1QsXG4gIENIQVJfRk9SV0FSRF9TTEFTSCxcbiAgQ0hBUl9MT1dFUkNBU0VfQSxcbiAgQ0hBUl9MT1dFUkNBU0VfWixcbiAgQ0hBUl9VUFBFUkNBU0VfQSxcbiAgQ0hBUl9VUFBFUkNBU0VfWixcbn0gZnJvbSBcIi4vX2NvbnN0YW50cy50c1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0UGF0aChwYXRoOiBzdHJpbmcpIHtcbiAgaWYgKHR5cGVvZiBwYXRoICE9PSBcInN0cmluZ1wiKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgIGBQYXRoIG11c3QgYmUgYSBzdHJpbmcuIFJlY2VpdmVkICR7SlNPTi5zdHJpbmdpZnkocGF0aCl9YCxcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Bvc2l4UGF0aFNlcGFyYXRvcihjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIGNvZGUgPT09IENIQVJfRk9SV0FSRF9TTEFTSDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUGF0aFNlcGFyYXRvcihjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzUG9zaXhQYXRoU2VwYXJhdG9yKGNvZGUpIHx8IGNvZGUgPT09IENIQVJfQkFDS1dBUkRfU0xBU0g7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1dpbmRvd3NEZXZpY2VSb290KGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIChjb2RlID49IENIQVJfTE9XRVJDQVNFX0EgJiYgY29kZSA8PSBDSEFSX0xPV0VSQ0FTRV9aKSB8fFxuICAgIChjb2RlID49IENIQVJfVVBQRVJDQVNFX0EgJiYgY29kZSA8PSBDSEFSX1VQUEVSQ0FTRV9aKVxuICApO1xufVxuXG4vLyBSZXNvbHZlcyAuIGFuZCAuLiBlbGVtZW50cyBpbiBhIHBhdGggd2l0aCBkaXJlY3RvcnkgbmFtZXNcbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVTdHJpbmcoXG4gIHBhdGg6IHN0cmluZyxcbiAgYWxsb3dBYm92ZVJvb3Q6IGJvb2xlYW4sXG4gIHNlcGFyYXRvcjogc3RyaW5nLFxuICBpc1BhdGhTZXBhcmF0b3I6IChjb2RlOiBudW1iZXIpID0+IGJvb2xlYW4sXG4pOiBzdHJpbmcge1xuICBsZXQgcmVzID0gXCJcIjtcbiAgbGV0IGxhc3RTZWdtZW50TGVuZ3RoID0gMDtcbiAgbGV0IGxhc3RTbGFzaCA9IC0xO1xuICBsZXQgZG90cyA9IDA7XG4gIGxldCBjb2RlOiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSBwYXRoLmxlbmd0aDsgaSA8PSBsZW47ICsraSkge1xuICAgIGlmIChpIDwgbGVuKSBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xuICAgIGVsc2UgaWYgKGlzUGF0aFNlcGFyYXRvcihjb2RlISkpIGJyZWFrO1xuICAgIGVsc2UgY29kZSA9IENIQVJfRk9SV0FSRF9TTEFTSDtcblxuICAgIGlmIChpc1BhdGhTZXBhcmF0b3IoY29kZSEpKSB7XG4gICAgICBpZiAobGFzdFNsYXNoID09PSBpIC0gMSB8fCBkb3RzID09PSAxKSB7XG4gICAgICAgIC8vIE5PT1BcbiAgICAgIH0gZWxzZSBpZiAobGFzdFNsYXNoICE9PSBpIC0gMSAmJiBkb3RzID09PSAyKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICByZXMubGVuZ3RoIDwgMiB8fFxuICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoICE9PSAyIHx8XG4gICAgICAgICAgcmVzLmNoYXJDb2RlQXQocmVzLmxlbmd0aCAtIDEpICE9PSBDSEFSX0RPVCB8fFxuICAgICAgICAgIHJlcy5jaGFyQ29kZUF0KHJlcy5sZW5ndGggLSAyKSAhPT0gQ0hBUl9ET1RcbiAgICAgICAgKSB7XG4gICAgICAgICAgaWYgKHJlcy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICBjb25zdCBsYXN0U2xhc2hJbmRleCA9IHJlcy5sYXN0SW5kZXhPZihzZXBhcmF0b3IpO1xuICAgICAgICAgICAgaWYgKGxhc3RTbGFzaEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICByZXMgPSBcIlwiO1xuICAgICAgICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXMgPSByZXMuc2xpY2UoMCwgbGFzdFNsYXNoSW5kZXgpO1xuICAgICAgICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IHJlcy5sZW5ndGggLSAxIC0gcmVzLmxhc3RJbmRleE9mKHNlcGFyYXRvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsYXN0U2xhc2ggPSBpO1xuICAgICAgICAgICAgZG90cyA9IDA7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHJlcy5sZW5ndGggPT09IDIgfHwgcmVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgcmVzID0gXCJcIjtcbiAgICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gMDtcbiAgICAgICAgICAgIGxhc3RTbGFzaCA9IGk7XG4gICAgICAgICAgICBkb3RzID0gMDtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoYWxsb3dBYm92ZVJvb3QpIHtcbiAgICAgICAgICBpZiAocmVzLmxlbmd0aCA+IDApIHJlcyArPSBgJHtzZXBhcmF0b3J9Li5gO1xuICAgICAgICAgIGVsc2UgcmVzID0gXCIuLlwiO1xuICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gMjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHJlcy5sZW5ndGggPiAwKSByZXMgKz0gc2VwYXJhdG9yICsgcGF0aC5zbGljZShsYXN0U2xhc2ggKyAxLCBpKTtcbiAgICAgICAgZWxzZSByZXMgPSBwYXRoLnNsaWNlKGxhc3RTbGFzaCArIDEsIGkpO1xuICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IGkgLSBsYXN0U2xhc2ggLSAxO1xuICAgICAgfVxuICAgICAgbGFzdFNsYXNoID0gaTtcbiAgICAgIGRvdHMgPSAwO1xuICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gQ0hBUl9ET1QgJiYgZG90cyAhPT0gLTEpIHtcbiAgICAgICsrZG90cztcbiAgICB9IGVsc2Uge1xuICAgICAgZG90cyA9IC0xO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaXBUcmFpbGluZ1NlcGFyYXRvcnMoXG4gIHNlZ21lbnQ6IHN0cmluZyxcbiAgaXNTZXA6IChjaGFyOiBudW1iZXIpID0+IGJvb2xlYW4sXG4pOiBzdHJpbmcge1xuICBpZiAoc2VnbWVudC5sZW5ndGggPD0gMSkge1xuICAgIHJldHVybiBzZWdtZW50O1xuICB9XG5cbiAgbGV0IGVuZCA9IHNlZ21lbnQubGVuZ3RoO1xuXG4gIGZvciAobGV0IGkgPSBzZWdtZW50Lmxlbmd0aCAtIDE7IGkgPiAwOyBpLS0pIHtcbiAgICBpZiAoaXNTZXAoc2VnbWVudC5jaGFyQ29kZUF0KGkpKSkge1xuICAgICAgZW5kID0gaTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHNlZ21l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