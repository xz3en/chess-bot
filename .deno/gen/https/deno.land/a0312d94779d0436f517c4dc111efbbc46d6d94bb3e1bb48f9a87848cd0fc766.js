import { RedisConnection } from "./connection.ts";
import { MuxExecutor } from "./executor.ts";
import { unwrapReply } from "./protocol/mod.ts";
import { createRedisPipeline } from "./pipeline.ts";
import { psubscribe, subscribe } from "./pubsub.ts";
import { convertMap, isCondArray, isNumber, isString, parseXGroupDetail, parseXId, parseXMessage, parseXPendingConsumers, parseXPendingCounts, parseXReadReply, rawnum, rawstr, xidstr } from "./stream.ts";
class RedisImpl {
    executor;
    get isClosed() {
        return this.executor.connection.isClosed;
    }
    get isConnected() {
        return this.executor.connection.isConnected;
    }
    constructor(executor){
        this.executor = executor;
    }
    sendCommand(command, ...args) {
        return this.executor.exec(command, ...args);
    }
    close() {
        this.executor.close();
    }
    async execReply(command, ...args) {
        const reply = await this.executor.exec(command, ...args);
        return unwrapReply(reply);
    }
    async execStatusReply(command, ...args) {
        const reply = await this.executor.exec(command, ...args);
        return reply.value();
    }
    async execIntegerReply(command, ...args) {
        const reply = await this.executor.exec(command, ...args);
        return reply.value();
    }
    async execBinaryReply(command, ...args) {
        const reply = await this.executor.exec(command, ...args);
        return reply.buffer();
    }
    async execBulkReply(command, ...args) {
        const reply = await this.executor.exec(command, ...args);
        return reply.value();
    }
    async execArrayReply(command, ...args) {
        const reply = await this.executor.exec(command, ...args);
        return reply.value();
    }
    async execIntegerOrNilReply(command, ...args) {
        const reply = await this.executor.exec(command, ...args);
        return reply.value();
    }
    async execStatusOrNilReply(command, ...args) {
        const reply = await this.executor.exec(command, ...args);
        return reply.value();
    }
    aclCat(categoryname) {
        if (categoryname !== undefined) {
            return this.execArrayReply("ACL", "CAT", categoryname);
        }
        return this.execArrayReply("ACL", "CAT");
    }
    aclDelUser(...usernames) {
        return this.execIntegerReply("ACL", "DELUSER", ...usernames);
    }
    aclGenPass(bits) {
        if (bits !== undefined) {
            return this.execBulkReply("ACL", "GENPASS", bits);
        }
        return this.execBulkReply("ACL", "GENPASS");
    }
    aclGetUser(username) {
        return this.execArrayReply("ACL", "GETUSER", username);
    }
    aclHelp() {
        return this.execArrayReply("ACL", "HELP");
    }
    aclList() {
        return this.execArrayReply("ACL", "LIST");
    }
    aclLoad() {
        return this.execStatusReply("ACL", "LOAD");
    }
    aclLog(param) {
        if (param === "RESET") {
            return this.execStatusReply("ACL", "LOG", "RESET");
        }
        return this.execArrayReply("ACL", "LOG", param);
    }
    aclSave() {
        return this.execStatusReply("ACL", "SAVE");
    }
    aclSetUser(username, ...rules) {
        return this.execStatusReply("ACL", "SETUSER", username, ...rules);
    }
    aclUsers() {
        return this.execArrayReply("ACL", "USERS");
    }
    aclWhoami() {
        return this.execBulkReply("ACL", "WHOAMI");
    }
    append(key, value) {
        return this.execIntegerReply("APPEND", key, value);
    }
    auth(param1, param2) {
        if (param2 !== undefined) {
            return this.execStatusReply("AUTH", param1, param2);
        }
        return this.execStatusReply("AUTH", param1);
    }
    bgrewriteaof() {
        return this.execStatusReply("BGREWRITEAOF");
    }
    bgsave() {
        return this.execStatusReply("BGSAVE");
    }
    bitcount(key, start, end) {
        if (start !== undefined && end !== undefined) {
            return this.execIntegerReply("BITCOUNT", key, start, end);
        }
        return this.execIntegerReply("BITCOUNT", key);
    }
    bitfield(key, opts) {
        const args = [
            key
        ];
        if (opts?.get) {
            const { type , offset  } = opts.get;
            args.push("GET", type, offset);
        }
        if (opts?.set) {
            const { type: type1 , offset: offset1 , value  } = opts.set;
            args.push("SET", type1, offset1, value);
        }
        if (opts?.incrby) {
            const { type: type2 , offset: offset2 , increment  } = opts.incrby;
            args.push("INCRBY", type2, offset2, increment);
        }
        if (opts?.overflow) {
            args.push("OVERFLOW", opts.overflow);
        }
        return this.execArrayReply("BITFIELD", ...args);
    }
    bitop(operation, destkey, ...keys) {
        return this.execIntegerReply("BITOP", operation, destkey, ...keys);
    }
    bitpos(key, bit, start, end) {
        if (start !== undefined && end !== undefined) {
            return this.execIntegerReply("BITPOS", key, bit, start, end);
        }
        if (start !== undefined) {
            return this.execIntegerReply("BITPOS", key, bit, start);
        }
        return this.execIntegerReply("BITPOS", key, bit);
    }
    blpop(timeout, ...keys) {
        return this.execArrayReply("BLPOP", ...keys, timeout);
    }
    brpop(timeout, ...keys) {
        return this.execArrayReply("BRPOP", ...keys, timeout);
    }
    brpoplpush(source, destination, timeout) {
        return this.execBulkReply("BRPOPLPUSH", source, destination, timeout);
    }
    bzpopmin(timeout, ...keys) {
        return this.execArrayReply("BZPOPMIN", ...keys, timeout);
    }
    bzpopmax(timeout, ...keys) {
        return this.execArrayReply("BZPOPMAX", ...keys, timeout);
    }
    clientCaching(mode) {
        return this.execStatusReply("CLIENT", "CACHING", mode);
    }
    clientGetName() {
        return this.execBulkReply("CLIENT", "GETNAME");
    }
    clientGetRedir() {
        return this.execIntegerReply("CLIENT", "GETREDIR");
    }
    clientID() {
        return this.execIntegerReply("CLIENT", "ID");
    }
    clientInfo() {
        return this.execBulkReply("CLIENT", "INFO");
    }
    clientKill(opts) {
        const args = [];
        if (opts.addr) {
            args.push("ADDR", opts.addr);
        }
        if (opts.laddr) {
            args.push("LADDR", opts.laddr);
        }
        if (opts.id) {
            args.push("ID", opts.id);
        }
        if (opts.type) {
            args.push("TYPE", opts.type);
        }
        if (opts.user) {
            args.push("USER", opts.user);
        }
        if (opts.skipme) {
            args.push("SKIPME", opts.skipme);
        }
        return this.execIntegerReply("CLIENT", "KILL", ...args);
    }
    clientList(opts) {
        if (opts && opts.type && opts.ids) {
            throw new Error("only one of `type` or `ids` can be specified");
        }
        if (opts && opts.type) {
            return this.execBulkReply("CLIENT", "LIST", "TYPE", opts.type);
        }
        if (opts && opts.ids) {
            return this.execBulkReply("CLIENT", "LIST", "ID", ...opts.ids);
        }
        return this.execBulkReply("CLIENT", "LIST");
    }
    clientPause(timeout, mode) {
        if (mode) {
            return this.execStatusReply("CLIENT", "PAUSE", timeout, mode);
        }
        return this.execStatusReply("CLIENT", "PAUSE", timeout);
    }
    clientSetName(connectionName) {
        return this.execStatusReply("CLIENT", "SETNAME", connectionName);
    }
    clientTracking(opts) {
        const args = [
            opts.mode
        ];
        if (opts.redirect) {
            args.push("REDIRECT", opts.redirect);
        }
        if (opts.prefixes) {
            opts.prefixes.forEach((prefix)=>{
                args.push("PREFIX");
                args.push(prefix);
            });
        }
        if (opts.bcast) {
            args.push("BCAST");
        }
        if (opts.optIn) {
            args.push("OPTIN");
        }
        if (opts.optOut) {
            args.push("OPTOUT");
        }
        if (opts.noLoop) {
            args.push("NOLOOP");
        }
        return this.execStatusReply("CLIENT", "TRACKING", ...args);
    }
    clientTrackingInfo() {
        return this.execArrayReply("CLIENT", "TRACKINGINFO");
    }
    clientUnblock(id, behaviour) {
        if (behaviour) {
            return this.execIntegerReply("CLIENT", "UNBLOCK", id, behaviour);
        }
        return this.execIntegerReply("CLIENT", "UNBLOCK", id);
    }
    clientUnpause() {
        return this.execStatusReply("CLIENT", "UNPAUSE");
    }
    asking() {
        return this.execStatusReply("ASKING");
    }
    clusterAddSlots(...slots) {
        return this.execStatusReply("CLUSTER", "ADDSLOTS", ...slots);
    }
    clusterCountFailureReports(nodeId) {
        return this.execIntegerReply("CLUSTER", "COUNT-FAILURE-REPORTS", nodeId);
    }
    clusterCountKeysInSlot(slot) {
        return this.execIntegerReply("CLUSTER", "COUNTKEYSINSLOT", slot);
    }
    clusterDelSlots(...slots) {
        return this.execStatusReply("CLUSTER", "DELSLOTS", ...slots);
    }
    clusterFailover(mode) {
        if (mode) {
            return this.execStatusReply("CLUSTER", "FAILOVER", mode);
        }
        return this.execStatusReply("CLUSTER", "FAILOVER");
    }
    clusterFlushSlots() {
        return this.execStatusReply("CLUSTER", "FLUSHSLOTS");
    }
    clusterForget(nodeId) {
        return this.execStatusReply("CLUSTER", "FORGET", nodeId);
    }
    clusterGetKeysInSlot(slot, count) {
        return this.execArrayReply("CLUSTER", "GETKEYSINSLOT", slot, count);
    }
    clusterInfo() {
        return this.execStatusReply("CLUSTER", "INFO");
    }
    clusterKeySlot(key) {
        return this.execIntegerReply("CLUSTER", "KEYSLOT", key);
    }
    clusterMeet(ip, port) {
        return this.execStatusReply("CLUSTER", "MEET", ip, port);
    }
    clusterMyID() {
        return this.execStatusReply("CLUSTER", "MYID");
    }
    clusterNodes() {
        return this.execBulkReply("CLUSTER", "NODES");
    }
    clusterReplicas(nodeId) {
        return this.execArrayReply("CLUSTER", "REPLICAS", nodeId);
    }
    clusterReplicate(nodeId) {
        return this.execStatusReply("CLUSTER", "REPLICATE", nodeId);
    }
    clusterReset(mode) {
        if (mode) {
            return this.execStatusReply("CLUSTER", "RESET", mode);
        }
        return this.execStatusReply("CLUSTER", "RESET");
    }
    clusterSaveConfig() {
        return this.execStatusReply("CLUSTER", "SAVECONFIG");
    }
    clusterSetSlot(slot, subcommand, nodeId) {
        if (nodeId !== undefined) {
            return this.execStatusReply("CLUSTER", "SETSLOT", slot, subcommand, nodeId);
        }
        return this.execStatusReply("CLUSTER", "SETSLOT", slot, subcommand);
    }
    clusterSlaves(nodeId) {
        return this.execArrayReply("CLUSTER", "SLAVES", nodeId);
    }
    clusterSlots() {
        return this.execArrayReply("CLUSTER", "SLOTS");
    }
    command() {
        return this.execArrayReply("COMMAND");
    }
    commandCount() {
        return this.execIntegerReply("COMMAND", "COUNT");
    }
    commandGetKeys() {
        return this.execArrayReply("COMMAND", "GETKEYS");
    }
    commandInfo(...commandNames) {
        return this.execArrayReply("COMMAND", "INFO", ...commandNames);
    }
    configGet(parameter) {
        return this.execArrayReply("CONFIG", "GET", parameter);
    }
    configResetStat() {
        return this.execStatusReply("CONFIG", "RESETSTAT");
    }
    configRewrite() {
        return this.execStatusReply("CONFIG", "REWRITE");
    }
    configSet(parameter, value) {
        return this.execStatusReply("CONFIG", "SET", parameter, value);
    }
    dbsize() {
        return this.execIntegerReply("DBSIZE");
    }
    debugObject(key) {
        return this.execStatusReply("DEBUG", "OBJECT", key);
    }
    debugSegfault() {
        return this.execStatusReply("DEBUG", "SEGFAULT");
    }
    decr(key) {
        return this.execIntegerReply("DECR", key);
    }
    decrby(key, decrement) {
        return this.execIntegerReply("DECRBY", key, decrement);
    }
    del(...keys) {
        return this.execIntegerReply("DEL", ...keys);
    }
    discard() {
        return this.execStatusReply("DISCARD");
    }
    dump(key) {
        return this.execBinaryReply("DUMP", key);
    }
    echo(message) {
        return this.execBulkReply("ECHO", message);
    }
    eval(script, keys, args) {
        return this.execReply("EVAL", script, keys.length, ...keys, ...args);
    }
    evalsha(sha1, keys, args) {
        return this.execReply("EVALSHA", sha1, keys.length, ...keys, ...args);
    }
    exec() {
        return this.execArrayReply("EXEC");
    }
    exists(...keys) {
        return this.execIntegerReply("EXISTS", ...keys);
    }
    expire(key, seconds) {
        return this.execIntegerReply("EXPIRE", key, seconds);
    }
    expireat(key, timestamp) {
        return this.execIntegerReply("EXPIREAT", key, timestamp);
    }
    flushall(async) {
        if (async) {
            return this.execStatusReply("FLUSHALL", "ASYNC");
        }
        return this.execStatusReply("FLUSHALL");
    }
    flushdb(async) {
        if (async) {
            return this.execStatusReply("FLUSHDB", "ASYNC");
        }
        return this.execStatusReply("FLUSHDB");
    }
    // deno-lint-ignore no-explicit-any
    geoadd(key, ...params) {
        const args = [
            key
        ];
        if (Array.isArray(params[0])) {
            args.push(...params.flatMap((e)=>e));
        } else if (typeof params[0] === "object") {
            for (const [member, lnglat] of Object.entries(params[0])){
                args.push(...lnglat, member);
            }
        } else {
            args.push(...params);
        }
        return this.execIntegerReply("GEOADD", ...args);
    }
    geohash(key, ...members) {
        return this.execArrayReply("GEOHASH", key, ...members);
    }
    geopos(key, ...members) {
        return this.execArrayReply("GEOPOS", key, ...members);
    }
    geodist(key, member1, member2, unit) {
        if (unit) {
            return this.execBulkReply("GEODIST", key, member1, member2, unit);
        }
        return this.execBulkReply("GEODIST", key, member1, member2);
    }
    georadius(key, longitude, latitude, radius, unit, opts) {
        const args = this.pushGeoRadiusOpts([
            key,
            longitude,
            latitude,
            radius,
            unit
        ], opts);
        return this.execArrayReply("GEORADIUS", ...args);
    }
    georadiusbymember(key, member, radius, unit, opts) {
        const args = this.pushGeoRadiusOpts([
            key,
            member,
            radius,
            unit
        ], opts);
        return this.execArrayReply("GEORADIUSBYMEMBER", ...args);
    }
    pushGeoRadiusOpts(args, opts) {
        if (opts?.withCoord) {
            args.push("WITHCOORD");
        }
        if (opts?.withDist) {
            args.push("WITHDIST");
        }
        if (opts?.withHash) {
            args.push("WITHHASH");
        }
        if (opts?.count !== undefined) {
            args.push(opts.count);
        }
        if (opts?.sort) {
            args.push(opts.sort);
        }
        if (opts?.store !== undefined) {
            args.push(opts.store);
        }
        if (opts?.storeDist !== undefined) {
            args.push(opts.storeDist);
        }
        return args;
    }
    get(key) {
        return this.execBulkReply("GET", key);
    }
    getbit(key, offset) {
        return this.execIntegerReply("GETBIT", key, offset);
    }
    getrange(key, start, end) {
        return this.execBulkReply("GETRANGE", key, start, end);
    }
    getset(key, value) {
        return this.execBulkReply("GETSET", key, value);
    }
    hdel(key, ...fields) {
        return this.execIntegerReply("HDEL", key, ...fields);
    }
    hexists(key, field) {
        return this.execIntegerReply("HEXISTS", key, field);
    }
    hget(key, field) {
        return this.execBulkReply("HGET", key, field);
    }
    hgetall(key) {
        return this.execArrayReply("HGETALL", key);
    }
    hincrby(key, field, increment) {
        return this.execIntegerReply("HINCRBY", key, field, increment);
    }
    hincrbyfloat(key, field, increment) {
        return this.execBulkReply("HINCRBYFLOAT", key, field, increment);
    }
    hkeys(key) {
        return this.execArrayReply("HKEYS", key);
    }
    hlen(key) {
        return this.execIntegerReply("HLEN", key);
    }
    hmget(key, ...fields) {
        return this.execArrayReply("HMGET", key, ...fields);
    }
    // deno-lint-ignore no-explicit-any
    hmset(key, ...params) {
        const args = [
            key
        ];
        if (Array.isArray(params[0])) {
            args.push(...params.flatMap((e)=>e));
        } else if (typeof params[0] === "object") {
            for (const [field, value] of Object.entries(params[0])){
                args.push(field, value);
            }
        } else {
            args.push(...params);
        }
        return this.execStatusReply("HMSET", ...args);
    }
    // deno-lint-ignore no-explicit-any
    hset(key, ...params) {
        const args = [
            key
        ];
        if (Array.isArray(params[0])) {
            args.push(...params.flatMap((e)=>e));
        } else if (typeof params[0] === "object") {
            for (const [field, value] of Object.entries(params[0])){
                args.push(field, value);
            }
        } else {
            args.push(...params);
        }
        return this.execIntegerReply("HSET", ...args);
    }
    hsetnx(key, field, value) {
        return this.execIntegerReply("HSETNX", key, field, value);
    }
    hstrlen(key, field) {
        return this.execIntegerReply("HSTRLEN", key, field);
    }
    hvals(key) {
        return this.execArrayReply("HVALS", key);
    }
    incr(key) {
        return this.execIntegerReply("INCR", key);
    }
    incrby(key, increment) {
        return this.execIntegerReply("INCRBY", key, increment);
    }
    incrbyfloat(key, increment) {
        return this.execBulkReply("INCRBYFLOAT", key, increment);
    }
    info(section) {
        if (section !== undefined) {
            return this.execStatusReply("INFO", section);
        }
        return this.execStatusReply("INFO");
    }
    keys(pattern) {
        return this.execArrayReply("KEYS", pattern);
    }
    lastsave() {
        return this.execIntegerReply("LASTSAVE");
    }
    lindex(key, index) {
        return this.execBulkReply("LINDEX", key, index);
    }
    linsert(key, loc, pivot, value) {
        return this.execIntegerReply("LINSERT", key, loc, pivot, value);
    }
    llen(key) {
        return this.execIntegerReply("LLEN", key);
    }
    lpop(key) {
        return this.execBulkReply("LPOP", key);
    }
    lpos(key, element, opts) {
        const args = [
            element
        ];
        if (opts?.rank != null) {
            args.push("RANK", String(opts.rank));
        }
        if (opts?.count != null) {
            args.push("COUNT", String(opts.count));
        }
        if (opts?.maxlen != null) {
            args.push("MAXLEN", String(opts.maxlen));
        }
        return opts?.count == null ? this.execIntegerReply("LPOS", key, ...args) : this.execArrayReply("LPOS", key, ...args);
    }
    lpush(key, ...elements) {
        return this.execIntegerReply("LPUSH", key, ...elements);
    }
    lpushx(key, ...elements) {
        return this.execIntegerReply("LPUSHX", key, ...elements);
    }
    lrange(key, start, stop) {
        return this.execArrayReply("LRANGE", key, start, stop);
    }
    lrem(key, count, element) {
        return this.execIntegerReply("LREM", key, count, element);
    }
    lset(key, index, element) {
        return this.execStatusReply("LSET", key, index, element);
    }
    ltrim(key, start, stop) {
        return this.execStatusReply("LTRIM", key, start, stop);
    }
    memoryDoctor() {
        return this.execBulkReply("MEMORY", "DOCTOR");
    }
    memoryHelp() {
        return this.execArrayReply("MEMORY", "HELP");
    }
    memoryMallocStats() {
        return this.execBulkReply("MEMORY", "MALLOC", "STATS");
    }
    memoryPurge() {
        return this.execStatusReply("MEMORY", "PURGE");
    }
    memoryStats() {
        return this.execArrayReply("MEMORY", "STATS");
    }
    memoryUsage(key, opts) {
        const args = [
            key
        ];
        if (opts?.samples !== undefined) {
            args.push("SAMPLES", opts.samples);
        }
        return this.execIntegerReply("MEMORY", "USAGE", ...args);
    }
    mget(...keys) {
        return this.execArrayReply("MGET", ...keys);
    }
    migrate(host, port, key, destinationDB, timeout, opts) {
        const args = [
            host,
            port,
            key,
            destinationDB,
            timeout
        ];
        if (opts?.copy) {
            args.push("COPY");
        }
        if (opts?.replace) {
            args.push("REPLACE");
        }
        if (opts?.auth !== undefined) {
            args.push("AUTH", opts.auth);
        }
        if (opts?.keys) {
            args.push("KEYS", ...opts.keys);
        }
        return this.execStatusReply("MIGRATE", ...args);
    }
    moduleList() {
        return this.execArrayReply("MODULE", "LIST");
    }
    moduleLoad(path, ...args) {
        return this.execStatusReply("MODULE", "LOAD", path, ...args);
    }
    moduleUnload(name) {
        return this.execStatusReply("MODULE", "UNLOAD", name);
    }
    monitor() {
        throw new Error("not supported yet");
    }
    move(key, db) {
        return this.execIntegerReply("MOVE", key, db);
    }
    // deno-lint-ignore no-explicit-any
    mset(...params) {
        const args = [];
        if (Array.isArray(params[0])) {
            args.push(...params.flatMap((e)=>e));
        } else if (typeof params[0] === "object") {
            for (const [key, value] of Object.entries(params[0])){
                args.push(key, value);
            }
        } else {
            args.push(...params);
        }
        return this.execStatusReply("MSET", ...args);
    }
    // deno-lint-ignore no-explicit-any
    msetnx(...params) {
        const args = [];
        if (Array.isArray(params[0])) {
            args.push(...params.flatMap((e)=>e));
        } else if (typeof params[0] === "object") {
            for (const [key, value] of Object.entries(params[0])){
                args.push(key, value);
            }
        } else {
            args.push(...params);
        }
        return this.execIntegerReply("MSETNX", ...args);
    }
    multi() {
        return this.execStatusReply("MULTI");
    }
    objectEncoding(key) {
        return this.execBulkReply("OBJECT", "ENCODING", key);
    }
    objectFreq(key) {
        return this.execIntegerOrNilReply("OBJECT", "FREQ", key);
    }
    objectHelp() {
        return this.execArrayReply("OBJECT", "HELP");
    }
    objectIdletime(key) {
        return this.execIntegerOrNilReply("OBJECT", "IDLETIME", key);
    }
    objectRefCount(key) {
        return this.execIntegerOrNilReply("OBJECT", "REFCOUNT", key);
    }
    persist(key) {
        return this.execIntegerReply("PERSIST", key);
    }
    pexpire(key, milliseconds) {
        return this.execIntegerReply("PEXPIRE", key, milliseconds);
    }
    pexpireat(key, millisecondsTimestamp) {
        return this.execIntegerReply("PEXPIREAT", key, millisecondsTimestamp);
    }
    pfadd(key, ...elements) {
        return this.execIntegerReply("PFADD", key, ...elements);
    }
    pfcount(...keys) {
        return this.execIntegerReply("PFCOUNT", ...keys);
    }
    pfmerge(destkey, ...sourcekeys) {
        return this.execStatusReply("PFMERGE", destkey, ...sourcekeys);
    }
    ping(message) {
        if (message) {
            return this.execBulkReply("PING", message);
        }
        return this.execStatusReply("PING");
    }
    psetex(key, milliseconds, value) {
        return this.execStatusReply("PSETEX", key, milliseconds, value);
    }
    publish(channel, message) {
        return this.execIntegerReply("PUBLISH", channel, message);
    }
    subscribe(...channels) {
        return subscribe(this.executor, ...channels);
    }
    psubscribe(...patterns) {
        return psubscribe(this.executor, ...patterns);
    }
    pubsubChannels(pattern) {
        if (pattern !== undefined) {
            return this.execArrayReply("PUBSUB", "CHANNELS", pattern);
        }
        return this.execArrayReply("PUBSUB", "CHANNELS");
    }
    pubsubNumpat() {
        return this.execIntegerReply("PUBSUB", "NUMPAT");
    }
    pubsubNumsub(...channels) {
        return this.execArrayReply("PUBSUB", "NUMSUBS", ...channels);
    }
    pttl(key) {
        return this.execIntegerReply("PTTL", key);
    }
    quit() {
        return this.execStatusReply("QUIT").finally(()=>this.close());
    }
    randomkey() {
        return this.execBulkReply("RANDOMKEY");
    }
    readonly() {
        return this.execStatusReply("READONLY");
    }
    readwrite() {
        return this.execStatusReply("READWRITE");
    }
    rename(key, newkey) {
        return this.execStatusReply("RENAME", key, newkey);
    }
    renamenx(key, newkey) {
        return this.execIntegerReply("RENAMENX", key, newkey);
    }
    restore(key, ttl, serializedValue, opts) {
        const args = [
            key,
            ttl,
            serializedValue
        ];
        if (opts?.replace) {
            args.push("REPLACE");
        }
        if (opts?.absttl) {
            args.push("ABSTTL");
        }
        if (opts?.idletime !== undefined) {
            args.push("IDLETIME", opts.idletime);
        }
        if (opts?.freq !== undefined) {
            args.push("FREQ", opts.freq);
        }
        return this.execStatusReply("RESTORE", ...args);
    }
    role() {
        return this.execArrayReply("ROLE");
    }
    rpop(key) {
        return this.execBulkReply("RPOP", key);
    }
    rpoplpush(source, destination) {
        return this.execBulkReply("RPOPLPUSH", source, destination);
    }
    rpush(key, ...elements) {
        return this.execIntegerReply("RPUSH", key, ...elements);
    }
    rpushx(key, ...elements) {
        return this.execIntegerReply("RPUSHX", key, ...elements);
    }
    sadd(key, ...members) {
        return this.execIntegerReply("SADD", key, ...members);
    }
    save() {
        return this.execStatusReply("SAVE");
    }
    scard(key) {
        return this.execIntegerReply("SCARD", key);
    }
    scriptDebug(mode) {
        return this.execStatusReply("SCRIPT", "DEBUG", mode);
    }
    scriptExists(...sha1s) {
        return this.execArrayReply("SCRIPT", "EXISTS", ...sha1s);
    }
    scriptFlush() {
        return this.execStatusReply("SCRIPT", "FLUSH");
    }
    scriptKill() {
        return this.execStatusReply("SCRIPT", "KILL");
    }
    scriptLoad(script) {
        return this.execStatusReply("SCRIPT", "LOAD", script);
    }
    sdiff(...keys) {
        return this.execArrayReply("SDIFF", ...keys);
    }
    sdiffstore(destination, ...keys) {
        return this.execIntegerReply("SDIFFSTORE", destination, ...keys);
    }
    select(index) {
        return this.execStatusReply("SELECT", index);
    }
    set(key, value, opts) {
        const args = [
            key,
            value
        ];
        if (opts?.ex !== undefined) {
            args.push("EX", opts.ex);
        } else if (opts?.px !== undefined) {
            args.push("PX", opts.px);
        }
        if (opts?.keepttl) {
            args.push("KEEPTTL");
        }
        if (opts?.mode) {
            args.push(opts.mode);
            return this.execStatusOrNilReply("SET", ...args);
        }
        return this.execStatusReply("SET", ...args);
    }
    setbit(key, offset, value) {
        return this.execIntegerReply("SETBIT", key, offset, value);
    }
    setex(key, seconds, value) {
        return this.execStatusReply("SETEX", key, seconds, value);
    }
    setnx(key, value) {
        return this.execIntegerReply("SETNX", key, value);
    }
    setrange(key, offset, value) {
        return this.execIntegerReply("SETRANGE", key, offset, value);
    }
    shutdown(mode) {
        if (mode) {
            return this.execStatusReply("SHUTDOWN", mode);
        }
        return this.execStatusReply("SHUTDOWN");
    }
    sinter(...keys) {
        return this.execArrayReply("SINTER", ...keys);
    }
    sinterstore(destination, ...keys) {
        return this.execIntegerReply("SINTERSTORE", destination, ...keys);
    }
    sismember(key, member) {
        return this.execIntegerReply("SISMEMBER", key, member);
    }
    slaveof(host, port) {
        return this.execStatusReply("SLAVEOF", host, port);
    }
    slaveofNoOne() {
        return this.execStatusReply("SLAVEOF", "NO ONE");
    }
    replicaof(host, port) {
        return this.execStatusReply("REPLICAOF", host, port);
    }
    replicaofNoOne() {
        return this.execStatusReply("REPLICAOF", "NO ONE");
    }
    slowlog(subcommand, ...args) {
        return this.execArrayReply("SLOWLOG", subcommand, ...args);
    }
    smembers(key) {
        return this.execArrayReply("SMEMBERS", key);
    }
    smove(source, destination, member) {
        return this.execIntegerReply("SMOVE", source, destination, member);
    }
    sort(key, opts) {
        const args = [
            key
        ];
        if (opts?.by !== undefined) {
            args.push("BY", opts.by);
        }
        if (opts?.limit) {
            args.push("LIMIT", opts.limit.offset, opts.limit.count);
        }
        if (opts?.patterns) {
            args.push("GET", ...opts.patterns);
        }
        if (opts?.order) {
            args.push(opts.order);
        }
        if (opts?.alpha) {
            args.push("ALPHA");
        }
        if (opts?.destination !== undefined) {
            args.push("STORE", opts.destination);
            return this.execIntegerReply("SORT", ...args);
        }
        return this.execArrayReply("SORT", ...args);
    }
    spop(key, count) {
        if (count !== undefined) {
            return this.execArrayReply("SPOP", key, count);
        }
        return this.execBulkReply("SPOP", key);
    }
    srandmember(key, count) {
        if (count !== undefined) {
            return this.execArrayReply("SRANDMEMBER", key, count);
        }
        return this.execBulkReply("SRANDMEMBER", key);
    }
    srem(key, ...members) {
        return this.execIntegerReply("SREM", key, ...members);
    }
    stralgo(algorithm, target, a, b, opts) {
        const args = [];
        if (opts?.idx) {
            args.push("IDX");
        }
        if (opts?.len) {
            args.push("LEN");
        }
        if (opts?.withmatchlen) {
            args.push("WITHMATCHLEN");
        }
        if (opts?.minmatchlen) {
            args.push("MINMATCHLEN");
            args.push(opts.minmatchlen);
        }
        return this.execBulkReply("STRALGO", algorithm, target, a, b, ...args);
    }
    strlen(key) {
        return this.execIntegerReply("STRLEN", key);
    }
    sunion(...keys) {
        return this.execArrayReply("SUNION", ...keys);
    }
    sunionstore(destination, ...keys) {
        return this.execIntegerReply("SUNIONSTORE", destination, ...keys);
    }
    swapdb(index1, index2) {
        return this.execStatusReply("SWAPDB", index1, index2);
    }
    sync() {
        throw new Error("not implemented");
    }
    time() {
        return this.execArrayReply("TIME");
    }
    touch(...keys) {
        return this.execIntegerReply("TOUCH", ...keys);
    }
    ttl(key) {
        return this.execIntegerReply("TTL", key);
    }
    type(key) {
        return this.execStatusReply("TYPE", key);
    }
    unlink(...keys) {
        return this.execIntegerReply("UNLINK", ...keys);
    }
    unwatch() {
        return this.execStatusReply("UNWATCH");
    }
    wait(numreplicas, timeout) {
        return this.execIntegerReply("WAIT", numreplicas, timeout);
    }
    watch(...keys) {
        return this.execStatusReply("WATCH", ...keys);
    }
    xack(key, group, ...xids) {
        return this.execIntegerReply("XACK", key, group, ...xids.map((xid)=>xidstr(xid)));
    }
    xadd(key, xid, fieldValues, maxlen = undefined) {
        const args = [
            key
        ];
        if (maxlen) {
            args.push("MAXLEN");
            if (maxlen.approx) {
                args.push("~");
            }
            args.push(maxlen.elements.toString());
        }
        args.push(xidstr(xid));
        if (fieldValues instanceof Map) {
            for (const [f, v] of fieldValues){
                args.push(f);
                args.push(v);
            }
        } else {
            for (const [f1, v1] of Object.entries(fieldValues)){
                args.push(f1);
                args.push(v1);
            }
        }
        return this.execBulkReply("XADD", ...args).then((rawId)=>parseXId(rawId));
    }
    xclaim(key, opts, ...xids) {
        const args = [];
        if (opts.idle) {
            args.push("IDLE");
            args.push(opts.idle);
        }
        if (opts.time) {
            args.push("TIME");
            args.push(opts.time);
        }
        if (opts.retryCount) {
            args.push("RETRYCOUNT");
            args.push(opts.retryCount);
        }
        if (opts.force) {
            args.push("FORCE");
        }
        if (opts.justXId) {
            args.push("JUSTID");
        }
        return this.execArrayReply("XCLAIM", key, opts.group, opts.consumer, opts.minIdleTime, ...xids.map((xid)=>xidstr(xid)), ...args).then((raw)=>{
            if (opts.justXId) {
                const xids = [];
                for (const r of raw){
                    if (typeof r === "string") {
                        xids.push(parseXId(r));
                    }
                }
                const payload = {
                    kind: "justxid",
                    xids
                };
                return payload;
            }
            const messages = [];
            for (const r1 of raw){
                if (typeof r1 !== "string") {
                    messages.push(parseXMessage(r1));
                }
            }
            const payload1 = {
                kind: "messages",
                messages
            };
            return payload1;
        });
    }
    xdel(key, ...xids) {
        return this.execIntegerReply("XDEL", key, ...xids.map((rawId)=>xidstr(rawId)));
    }
    xlen(key) {
        return this.execIntegerReply("XLEN", key);
    }
    xgroupCreate(key, groupName, xid, mkstream) {
        const args = [];
        if (mkstream) {
            args.push("MKSTREAM");
        }
        return this.execStatusReply("XGROUP", "CREATE", key, groupName, xidstr(xid), ...args);
    }
    xgroupDelConsumer(key, groupName, consumerName) {
        return this.execIntegerReply("XGROUP", "DELCONSUMER", key, groupName, consumerName);
    }
    xgroupDestroy(key, groupName) {
        return this.execIntegerReply("XGROUP", "DESTROY", key, groupName);
    }
    xgroupHelp() {
        return this.execBulkReply("XGROUP", "HELP");
    }
    xgroupSetID(key, groupName, xid) {
        return this.execStatusReply("XGROUP", "SETID", key, groupName, xidstr(xid));
    }
    xinfoStream(key) {
        return this.execArrayReply("XINFO", "STREAM", key).then((raw)=>{
            // Note that you should not rely on the fields
            // exact position, nor on the number of fields,
            // new fields may be added in the future.
            const data = convertMap(raw);
            const firstEntry = parseXMessage(data.get("first-entry"));
            const lastEntry = parseXMessage(data.get("last-entry"));
            return {
                length: rawnum(data.get("length")),
                radixTreeKeys: rawnum(data.get("radix-tree-keys")),
                radixTreeNodes: rawnum(data.get("radix-tree-nodes")),
                groups: rawnum(data.get("groups")),
                lastGeneratedId: parseXId(rawstr(data.get("last-generated-id"))),
                firstEntry,
                lastEntry
            };
        });
    }
    xinfoStreamFull(key, count) {
        const args = [];
        if (count) {
            args.push("COUNT");
            args.push(count);
        }
        return this.execArrayReply("XINFO", "STREAM", key, "FULL", ...args).then((raw)=>{
            // Note that you should not rely on the fields
            // exact position, nor on the number of fields,
            // new fields may be added in the future.
            if (raw === undefined) throw "no data";
            const data = convertMap(raw);
            if (data === undefined) throw "no data converted";
            const entries = data.get("entries").map((raw)=>parseXMessage(raw));
            return {
                length: rawnum(data.get("length")),
                radixTreeKeys: rawnum(data.get("radix-tree-keys")),
                radixTreeNodes: rawnum(data.get("radix-tree-nodes")),
                lastGeneratedId: parseXId(rawstr(data.get("last-generated-id"))),
                entries,
                groups: parseXGroupDetail(data.get("groups"))
            };
        });
    }
    xinfoGroups(key) {
        return this.execArrayReply("XINFO", "GROUPS", key).then((raws)=>raws.map((raw)=>{
                const data = convertMap(raw);
                return {
                    name: rawstr(data.get("name")),
                    consumers: rawnum(data.get("consumers")),
                    pending: rawnum(data.get("pending")),
                    lastDeliveredId: parseXId(rawstr(data.get("last-delivered-id")))
                };
            }));
    }
    xinfoConsumers(key, group) {
        return this.execArrayReply("XINFO", "CONSUMERS", key, group).then((raws)=>raws.map((raw)=>{
                const data = convertMap(raw);
                return {
                    name: rawstr(data.get("name")),
                    pending: rawnum(data.get("pending")),
                    idle: rawnum(data.get("idle"))
                };
            }));
    }
    xpending(key, group) {
        return this.execArrayReply("XPENDING", key, group).then((raw)=>{
            if (isNumber(raw[0]) && isString(raw[1]) && isString(raw[2]) && isCondArray(raw[3])) {
                return {
                    count: raw[0],
                    startId: parseXId(raw[1]),
                    endId: parseXId(raw[2]),
                    consumers: parseXPendingConsumers(raw[3])
                };
            } else {
                throw "parse err";
            }
        });
    }
    xpendingCount(key, group, startEndCount, consumer) {
        const args = [];
        args.push(startEndCount.start);
        args.push(startEndCount.end);
        args.push(startEndCount.count);
        if (consumer) {
            args.push(consumer);
        }
        return this.execArrayReply("XPENDING", key, group, ...args).then((raw)=>parseXPendingCounts(raw));
    }
    xrange(key, start, end, count) {
        const args = [
            key,
            xidstr(start),
            xidstr(end)
        ];
        if (count) {
            args.push("COUNT");
            args.push(count);
        }
        return this.execArrayReply("XRANGE", ...args).then((raw)=>raw.map((m)=>parseXMessage(m)));
    }
    xrevrange(key, start, end, count) {
        const args = [
            key,
            xidstr(start),
            xidstr(end)
        ];
        if (count) {
            args.push("COUNT");
            args.push(count);
        }
        return this.execArrayReply("XREVRANGE", ...args).then((raw)=>raw.map((m)=>parseXMessage(m)));
    }
    xread(keyXIds, opts) {
        const args = [];
        if (opts) {
            if (opts.count) {
                args.push("COUNT");
                args.push(opts.count);
            }
            if (opts.block) {
                args.push("BLOCK");
                args.push(opts.block);
            }
        }
        args.push("STREAMS");
        const theKeys = [];
        const theXIds = [];
        for (const a of keyXIds){
            if (a instanceof Array) {
                // XKeyIdLike
                theKeys.push(a[0]);
                theXIds.push(xidstr(a[1]));
            } else {
                // XKeyId
                theKeys.push(a.key);
                theXIds.push(xidstr(a.xid));
            }
        }
        return this.execArrayReply("XREAD", ...args.concat(theKeys).concat(theXIds)).then((raw)=>parseXReadReply(raw));
    }
    xreadgroup(keyXIds, { group , consumer , count , block  }) {
        const args = [
            "GROUP",
            group,
            consumer
        ];
        if (count) {
            args.push("COUNT");
            args.push(count);
        }
        if (block) {
            args.push("BLOCK");
            args.push(block);
        }
        args.push("STREAMS");
        const theKeys = [];
        const theXIds = [];
        for (const a of keyXIds){
            if (a instanceof Array) {
                // XKeyIdGroupLike
                theKeys.push(a[0]);
                theXIds.push(a[1] === ">" ? ">" : xidstr(a[1]));
            } else {
                // XKeyIdGroup
                theKeys.push(a.key);
                theXIds.push(a.xid === ">" ? ">" : xidstr(a.xid));
            }
        }
        return this.execArrayReply("XREADGROUP", ...args.concat(theKeys).concat(theXIds)).then((raw)=>parseXReadReply(raw));
    }
    xtrim(key, maxlen) {
        const args = [];
        if (maxlen.approx) {
            args.push("~");
        }
        args.push(maxlen.elements);
        return this.execIntegerReply("XTRIM", key, "MAXLEN", ...args);
    }
    zadd(key, param1, param2, opts) {
        const args = [
            key
        ];
        if (Array.isArray(param1)) {
            this.pushZAddOpts(args, param2);
            args.push(...param1.flatMap((e)=>e));
            opts = param2;
        } else if (typeof param1 === "object") {
            this.pushZAddOpts(args, param2);
            for (const [member, score] of Object.entries(param1)){
                args.push(score, member);
            }
        } else {
            this.pushZAddOpts(args, opts);
            args.push(param1, param2);
        }
        return this.execIntegerReply("ZADD", ...args);
    }
    pushZAddOpts(args, opts) {
        if (opts?.mode) {
            args.push(opts.mode);
        }
        if (opts?.ch) {
            args.push("CH");
        }
    }
    zaddIncr(key, score, member, opts) {
        const args = [
            key,
            score,
            member
        ];
        if (opts?.mode) {
            args.push(opts.mode);
        }
        if (opts?.ch) {
            args.push("CH");
        }
        args.push("INCR");
        return this.execBulkReply("ZADD", ...args);
    }
    zcard(key) {
        return this.execIntegerReply("ZCARD", key);
    }
    zcount(key, min, max) {
        return this.execIntegerReply("ZCOUNT", key, min, max);
    }
    zincrby(key, increment, member) {
        return this.execBulkReply("ZINCRBY", key, increment, member);
    }
    zinterstore(destination, keys, opts) {
        const args = this.pushZStoreArgs([
            destination
        ], keys, opts);
        return this.execIntegerReply("ZINTERSTORE", ...args);
    }
    zunionstore(destination, keys, opts) {
        const args = this.pushZStoreArgs([
            destination
        ], keys, opts);
        return this.execIntegerReply("ZUNIONSTORE", ...args);
    }
    pushZStoreArgs(args, keys, opts) {
        if (Array.isArray(keys)) {
            args.push(keys.length);
            if (Array.isArray(keys[0])) {
                keys = keys;
                args.push(...keys.map((e)=>e[0]));
                args.push("WEIGHTS");
                args.push(...keys.map((e)=>e[1]));
            } else {
                args.push(...keys);
            }
        } else {
            args.push(Object.keys(keys).length);
            args.push(...Object.keys(keys));
            args.push("WEIGHTS");
            args.push(...Object.values(keys));
        }
        if (opts?.aggregate) {
            args.push("AGGREGATE", opts.aggregate);
        }
        return args;
    }
    zlexcount(key, min, max) {
        return this.execIntegerReply("ZLEXCOUNT", key, min, max);
    }
    zpopmax(key, count) {
        if (count !== undefined) {
            return this.execArrayReply("ZPOPMAX", key, count);
        }
        return this.execArrayReply("ZPOPMAX", key);
    }
    zpopmin(key, count) {
        if (count !== undefined) {
            return this.execArrayReply("ZPOPMIN", key, count);
        }
        return this.execArrayReply("ZPOPMIN", key);
    }
    zrange(key, start, stop, opts) {
        const args = this.pushZRangeOpts([
            key,
            start,
            stop
        ], opts);
        return this.execArrayReply("ZRANGE", ...args);
    }
    zrangebylex(key, min, max, opts) {
        const args = this.pushZRangeOpts([
            key,
            min,
            max
        ], opts);
        return this.execArrayReply("ZRANGEBYLEX", ...args);
    }
    zrangebyscore(key, min, max, opts) {
        const args = this.pushZRangeOpts([
            key,
            min,
            max
        ], opts);
        return this.execArrayReply("ZRANGEBYSCORE", ...args);
    }
    zrank(key, member) {
        return this.execIntegerOrNilReply("ZRANK", key, member);
    }
    zrem(key, ...members) {
        return this.execIntegerReply("ZREM", key, ...members);
    }
    zremrangebylex(key, min, max) {
        return this.execIntegerReply("ZREMRANGEBYLEX", key, min, max);
    }
    zremrangebyrank(key, start, stop) {
        return this.execIntegerReply("ZREMRANGEBYRANK", key, start, stop);
    }
    zremrangebyscore(key, min, max) {
        return this.execIntegerReply("ZREMRANGEBYSCORE", key, min, max);
    }
    zrevrange(key, start, stop, opts) {
        const args = this.pushZRangeOpts([
            key,
            start,
            stop
        ], opts);
        return this.execArrayReply("ZREVRANGE", ...args);
    }
    zrevrangebylex(key, max, min, opts) {
        const args = this.pushZRangeOpts([
            key,
            min,
            max
        ], opts);
        return this.execArrayReply("ZREVRANGEBYLEX", ...args);
    }
    zrevrangebyscore(key, max, min, opts) {
        const args = this.pushZRangeOpts([
            key,
            max,
            min
        ], opts);
        return this.execArrayReply("ZREVRANGEBYSCORE", ...args);
    }
    pushZRangeOpts(args, opts) {
        if (opts?.withScore) {
            args.push("WITHSCORES");
        }
        if (opts?.limit) {
            args.push("LIMIT", opts.limit.offset, opts.limit.count);
        }
        return args;
    }
    zrevrank(key, member) {
        return this.execIntegerOrNilReply("ZREVRANK", key, member);
    }
    zscore(key, member) {
        return this.execBulkReply("ZSCORE", key, member);
    }
    scan(cursor, opts) {
        const args = this.pushScanOpts([
            cursor
        ], opts);
        return this.execArrayReply("SCAN", ...args);
    }
    sscan(key, cursor, opts) {
        const args = this.pushScanOpts([
            key,
            cursor
        ], opts);
        return this.execArrayReply("SSCAN", ...args);
    }
    hscan(key, cursor, opts) {
        const args = this.pushScanOpts([
            key,
            cursor
        ], opts);
        return this.execArrayReply("HSCAN", ...args);
    }
    zscan(key, cursor, opts) {
        const args = this.pushScanOpts([
            key,
            cursor
        ], opts);
        return this.execArrayReply("ZSCAN", ...args);
    }
    pushScanOpts(args, opts) {
        if (opts?.pattern !== undefined) {
            args.push("MATCH", opts.pattern);
        }
        if (opts?.count !== undefined) {
            args.push("COUNT", opts.count);
        }
        if (opts?.type !== undefined) {
            args.push("TYPE", opts.type);
        }
        return args;
    }
    tx() {
        return createRedisPipeline(this.executor.connection, true);
    }
    pipeline() {
        return createRedisPipeline(this.executor.connection);
    }
}
/**
 * Connect to Redis server
 * @param options
 * @example
 * ```ts
 * import { connect } from "./mod.ts";
 * const conn1 = await connect({hostname: "127.0.0.1", port: 6379}); // -> TCP, 127.0.0.1:6379
 * const conn2 = await connect({hostname: "redis.proxy", port: 443, tls: true}); // -> TLS, redis.proxy:443
 * ```
 */ export async function connect(options) {
    const connection = createRedisConnection(options);
    await connection.connect();
    const executor = new MuxExecutor(connection);
    return create(executor);
}
/**
 * Create a lazy Redis client that will not establish a connection until a command is actually executed.
 *
 * ```ts
 * import { createLazyClient } from "./mod.ts";
 *
 * const client = createLazyClient({ hostname: "127.0.0.1", port: 6379 });
 * console.assert(!client.isConnected);
 * await client.get("foo");
 * console.assert(client.isConnected);
 * ```
 */ export function createLazyClient(options) {
    const connection = createRedisConnection(options);
    const executor = createLazyExecutor(connection);
    return create(executor);
}
/**
 * Create a redis client from `CommandExecutor`
 */ export function create(executor) {
    return new RedisImpl(executor);
}
/**
 * Extract RedisConnectOptions from redis URL
 * @param url
 * @example
 * ```ts
 * import { parseURL } from "./mod.ts";
 *
 * parseURL("redis://foo:bar@localhost:6379/1"); // -> {hostname: "localhost", port: "6379", tls: false, db: 1, name: foo, password: bar}
 * parseURL("rediss://127.0.0.1:443/?db=2&password=bar"); // -> {hostname: "127.0.0.1", port: "443", tls: true, db: 2, name: undefined, password: bar}
 * ```
 */ export function parseURL(url) {
    const { protocol , hostname , port , username , password , pathname , searchParams  } = new URL(url);
    const db = pathname.replace("/", "") !== "" ? pathname.replace("/", "") : searchParams.get("db") ?? undefined;
    return {
        hostname: hostname !== "" ? hostname : "localhost",
        port: port !== "" ? parseInt(port, 10) : 6379,
        tls: protocol == "rediss:" ? true : searchParams.get("ssl") === "true",
        db: db ? parseInt(db, 10) : undefined,
        name: username !== "" ? username : undefined,
        password: password !== "" ? password : searchParams.get("password") ?? undefined
    };
}
function createRedisConnection(options) {
    const { hostname , port =6379 , ...opts } = options;
    return new RedisConnection(hostname, port, opts);
}
function createLazyExecutor(connection) {
    let executor = null;
    return {
        get connection () {
            return connection;
        },
        async exec (command, ...args) {
            if (!executor) {
                executor = new MuxExecutor(connection);
                await connection.connect();
            }
            return executor.exec(command, ...args);
        },
        close () {
            if (executor) {
                return executor.close();
            }
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvcmVkaXNAdjAuMjUuMS9yZWRpcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7XG4gIEFDTExvZ01vZGUsXG4gIEJpdGZpZWxkT3B0cyxcbiAgQml0ZmllbGRXaXRoT3ZlcmZsb3dPcHRzLFxuICBDbGllbnRDYWNoaW5nTW9kZSxcbiAgQ2xpZW50S2lsbE9wdHMsXG4gIENsaWVudExpc3RPcHRzLFxuICBDbGllbnRQYXVzZU1vZGUsXG4gIENsaWVudFRyYWNraW5nT3B0cyxcbiAgQ2xpZW50VW5ibG9ja2luZ0JlaGF2aW91cixcbiAgQ2x1c3RlckZhaWxvdmVyTW9kZSxcbiAgQ2x1c3RlclJlc2V0TW9kZSxcbiAgQ2x1c3RlclNldFNsb3RTdWJjb21tYW5kLFxuICBHZW9SYWRpdXNPcHRzLFxuICBHZW9Vbml0LFxuICBIU2Nhbk9wdHMsXG4gIExJbnNlcnRMb2NhdGlvbixcbiAgTFBvc09wdHMsXG4gIExQb3NXaXRoQ291bnRPcHRzLFxuICBNZW1vcnlVc2FnZU9wdHMsXG4gIE1pZ3JhdGVPcHRzLFxuICBSZWRpc0NvbW1hbmRzLFxuICBSZXN0b3JlT3B0cyxcbiAgU2Nhbk9wdHMsXG4gIFNjcmlwdERlYnVnTW9kZSxcbiAgU2V0T3B0cyxcbiAgU2V0V2l0aE1vZGVPcHRzLFxuICBTaHV0ZG93bk1vZGUsXG4gIFNvcnRPcHRzLFxuICBTb3J0V2l0aERlc3RpbmF0aW9uT3B0cyxcbiAgU1NjYW5PcHRzLFxuICBTdHJhbGdvQWxnb3JpdGhtLFxuICBTdHJhbGdvT3B0cyxcbiAgU3RyYWxnb1RhcmdldCxcbiAgWkFkZE9wdHMsXG4gIFpJbnRlcnN0b3JlT3B0cyxcbiAgWlJhbmdlQnlMZXhPcHRzLFxuICBaUmFuZ2VCeVNjb3JlT3B0cyxcbiAgWlJhbmdlT3B0cyxcbiAgWlNjYW5PcHRzLFxuICBaVW5pb25zdG9yZU9wdHMsXG59IGZyb20gXCIuL2NvbW1hbmQudHNcIjtcbmltcG9ydCB7IFJlZGlzQ29ubmVjdGlvbiB9IGZyb20gXCIuL2Nvbm5lY3Rpb24udHNcIjtcbmltcG9ydCB0eXBlIHsgQ29ubmVjdGlvbiB9IGZyb20gXCIuL2Nvbm5lY3Rpb24udHNcIjtcbmltcG9ydCB0eXBlIHsgUmVkaXNDb25uZWN0aW9uT3B0aW9ucyB9IGZyb20gXCIuL2Nvbm5lY3Rpb24udHNcIjtcbmltcG9ydCB7IENvbW1hbmRFeGVjdXRvciwgTXV4RXhlY3V0b3IgfSBmcm9tIFwiLi9leGVjdXRvci50c1wiO1xuaW1wb3J0IHsgdW53cmFwUmVwbHkgfSBmcm9tIFwiLi9wcm90b2NvbC9tb2QudHNcIjtcbmltcG9ydCB0eXBlIHtcbiAgQmluYXJ5LFxuICBCdWxrLFxuICBCdWxrTmlsLFxuICBCdWxrUmVwbHksXG4gIEJ1bGtTdHJpbmcsXG4gIENvbmRpdGlvbmFsQXJyYXksXG4gIEludGVnZXIsXG4gIFJhdyxcbiAgUmVkaXNSZXBseSxcbiAgUmVkaXNWYWx1ZSxcbiAgU2ltcGxlU3RyaW5nLFxufSBmcm9tIFwiLi9wcm90b2NvbC9tb2QudHNcIjtcbmltcG9ydCB7IGNyZWF0ZVJlZGlzUGlwZWxpbmUgfSBmcm9tIFwiLi9waXBlbGluZS50c1wiO1xuaW1wb3J0IHsgcHN1YnNjcmliZSwgc3Vic2NyaWJlIH0gZnJvbSBcIi4vcHVic3ViLnRzXCI7XG5pbXBvcnQge1xuICBjb252ZXJ0TWFwLFxuICBpc0NvbmRBcnJheSxcbiAgaXNOdW1iZXIsXG4gIGlzU3RyaW5nLFxuICBwYXJzZVhHcm91cERldGFpbCxcbiAgcGFyc2VYSWQsXG4gIHBhcnNlWE1lc3NhZ2UsXG4gIHBhcnNlWFBlbmRpbmdDb25zdW1lcnMsXG4gIHBhcnNlWFBlbmRpbmdDb3VudHMsXG4gIHBhcnNlWFJlYWRSZXBseSxcbiAgcmF3bnVtLFxuICByYXdzdHIsXG4gIFN0YXJ0RW5kQ291bnQsXG4gIFhBZGRGaWVsZFZhbHVlcyxcbiAgWENsYWltSnVzdFhJZCxcbiAgWENsYWltTWVzc2FnZXMsXG4gIFhDbGFpbU9wdHMsXG4gIFhJZCxcbiAgWElkQWRkLFxuICBYSWRJbnB1dCxcbiAgWElkTmVnLFxuICBYSWRQb3MsXG4gIHhpZHN0cixcbiAgWEtleUlkLFxuICBYS2V5SWRHcm91cCxcbiAgWEtleUlkR3JvdXBMaWtlLFxuICBYS2V5SWRMaWtlLFxuICBYTWF4bGVuLFxuICBYUmVhZEdyb3VwT3B0cyxcbiAgWFJlYWRJZERhdGEsXG4gIFhSZWFkT3B0cyxcbiAgWFJlYWRTdHJlYW1SYXcsXG59IGZyb20gXCIuL3N0cmVhbS50c1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlZGlzIGV4dGVuZHMgUmVkaXNDb21tYW5kcyB7XG4gIHJlYWRvbmx5IGlzQ2xvc2VkOiBib29sZWFuO1xuICByZWFkb25seSBpc0Nvbm5lY3RlZDogYm9vbGVhbjtcblxuICAvKipcbiAgICogTG93IGxldmVsIGludGVyZmFjZSBmb3IgUmVkaXMgc2VydmVyXG4gICAqL1xuICBzZW5kQ29tbWFuZChjb21tYW5kOiBzdHJpbmcsIC4uLmFyZ3M6IFJlZGlzVmFsdWVbXSk6IFByb21pc2U8UmVkaXNSZXBseT47XG4gIGNsb3NlKCk6IHZvaWQ7XG59XG5cbmNsYXNzIFJlZGlzSW1wbCBpbXBsZW1lbnRzIFJlZGlzIHtcbiAgcHJpdmF0ZSByZWFkb25seSBleGVjdXRvcjogQ29tbWFuZEV4ZWN1dG9yO1xuXG4gIGdldCBpc0Nsb3NlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjdXRvci5jb25uZWN0aW9uLmlzQ2xvc2VkO1xuICB9XG5cbiAgZ2V0IGlzQ29ubmVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWN1dG9yLmNvbm5lY3Rpb24uaXNDb25uZWN0ZWQ7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihleGVjdXRvcjogQ29tbWFuZEV4ZWN1dG9yKSB7XG4gICAgdGhpcy5leGVjdXRvciA9IGV4ZWN1dG9yO1xuICB9XG5cbiAgc2VuZENvbW1hbmQoY29tbWFuZDogc3RyaW5nLCAuLi5hcmdzOiBSZWRpc1ZhbHVlW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjdXRvci5leGVjKGNvbW1hbmQsIC4uLmFyZ3MpO1xuICB9XG5cbiAgY2xvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5leGVjdXRvci5jbG9zZSgpO1xuICB9XG5cbiAgYXN5bmMgZXhlY1JlcGx5KGNvbW1hbmQ6IHN0cmluZywgLi4uYXJnczogUmVkaXNWYWx1ZVtdKTogUHJvbWlzZTxSYXc+IHtcbiAgICBjb25zdCByZXBseSA9IGF3YWl0IHRoaXMuZXhlY3V0b3IuZXhlYyhcbiAgICAgIGNvbW1hbmQsXG4gICAgICAuLi5hcmdzLFxuICAgICk7XG4gICAgcmV0dXJuIHVud3JhcFJlcGx5KHJlcGx5KSBhcyBSYXc7XG4gIH1cblxuICBhc3luYyBleGVjU3RhdHVzUmVwbHkoXG4gICAgY29tbWFuZDogc3RyaW5nLFxuICAgIC4uLmFyZ3M6IFJlZGlzVmFsdWVbXVxuICApOiBQcm9taXNlPFNpbXBsZVN0cmluZz4ge1xuICAgIGNvbnN0IHJlcGx5ID0gYXdhaXQgdGhpcy5leGVjdXRvci5leGVjKGNvbW1hbmQsIC4uLmFyZ3MpO1xuICAgIHJldHVybiByZXBseS52YWx1ZSgpIGFzIFNpbXBsZVN0cmluZztcbiAgfVxuXG4gIGFzeW5jIGV4ZWNJbnRlZ2VyUmVwbHkoXG4gICAgY29tbWFuZDogc3RyaW5nLFxuICAgIC4uLmFyZ3M6IFJlZGlzVmFsdWVbXVxuICApOiBQcm9taXNlPEludGVnZXI+IHtcbiAgICBjb25zdCByZXBseSA9IGF3YWl0IHRoaXMuZXhlY3V0b3IuZXhlYyhjb21tYW5kLCAuLi5hcmdzKTtcbiAgICByZXR1cm4gcmVwbHkudmFsdWUoKSBhcyBJbnRlZ2VyO1xuICB9XG5cbiAgYXN5bmMgZXhlY0JpbmFyeVJlcGx5KFxuICAgIGNvbW1hbmQ6IHN0cmluZyxcbiAgICAuLi5hcmdzOiBSZWRpc1ZhbHVlW11cbiAgKTogUHJvbWlzZTxCaW5hcnkgfCBCdWxrTmlsPiB7XG4gICAgY29uc3QgcmVwbHkgPSBhd2FpdCB0aGlzLmV4ZWN1dG9yLmV4ZWMoY29tbWFuZCwgLi4uYXJncykgYXMgQnVsa1JlcGx5O1xuICAgIHJldHVybiByZXBseS5idWZmZXIoKTtcbiAgfVxuXG4gIGFzeW5jIGV4ZWNCdWxrUmVwbHk8VCBleHRlbmRzIEJ1bGsgPSBCdWxrPihcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgLi4uYXJnczogUmVkaXNWYWx1ZVtdXG4gICk6IFByb21pc2U8VD4ge1xuICAgIGNvbnN0IHJlcGx5ID0gYXdhaXQgdGhpcy5leGVjdXRvci5leGVjKGNvbW1hbmQsIC4uLmFyZ3MpO1xuICAgIHJldHVybiByZXBseS52YWx1ZSgpIGFzIFQ7XG4gIH1cblxuICBhc3luYyBleGVjQXJyYXlSZXBseTxUIGV4dGVuZHMgUmF3ID0gUmF3PihcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgLi4uYXJnczogUmVkaXNWYWx1ZVtdXG4gICk6IFByb21pc2U8VFtdPiB7XG4gICAgY29uc3QgcmVwbHkgPSBhd2FpdCB0aGlzLmV4ZWN1dG9yLmV4ZWMoY29tbWFuZCwgLi4uYXJncyk7XG4gICAgcmV0dXJuIHJlcGx5LnZhbHVlKCkgYXMgVFtdO1xuICB9XG5cbiAgYXN5bmMgZXhlY0ludGVnZXJPck5pbFJlcGx5KFxuICAgIGNvbW1hbmQ6IHN0cmluZyxcbiAgICAuLi5hcmdzOiBSZWRpc1ZhbHVlW11cbiAgKTogUHJvbWlzZTxJbnRlZ2VyIHwgQnVsa05pbD4ge1xuICAgIGNvbnN0IHJlcGx5ID0gYXdhaXQgdGhpcy5leGVjdXRvci5leGVjKGNvbW1hbmQsIC4uLmFyZ3MpO1xuICAgIHJldHVybiByZXBseS52YWx1ZSgpIGFzIEludGVnZXIgfCBCdWxrTmlsO1xuICB9XG5cbiAgYXN5bmMgZXhlY1N0YXR1c09yTmlsUmVwbHkoXG4gICAgY29tbWFuZDogc3RyaW5nLFxuICAgIC4uLmFyZ3M6IFJlZGlzVmFsdWVbXVxuICApOiBQcm9taXNlPFNpbXBsZVN0cmluZyB8IEJ1bGtOaWw+IHtcbiAgICBjb25zdCByZXBseSA9IGF3YWl0IHRoaXMuZXhlY3V0b3IuZXhlYyhjb21tYW5kLCAuLi5hcmdzKTtcbiAgICByZXR1cm4gcmVwbHkudmFsdWUoKSBhcyBTaW1wbGVTdHJpbmcgfCBCdWxrTmlsO1xuICB9XG5cbiAgYWNsQ2F0KGNhdGVnb3J5bmFtZT86IHN0cmluZykge1xuICAgIGlmIChjYXRlZ29yeW5hbWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZz4oXCJBQ0xcIiwgXCJDQVRcIiwgY2F0ZWdvcnluYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZz4oXCJBQ0xcIiwgXCJDQVRcIik7XG4gIH1cblxuICBhY2xEZWxVc2VyKC4uLnVzZXJuYW1lczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiQUNMXCIsIFwiREVMVVNFUlwiLCAuLi51c2VybmFtZXMpO1xuICB9XG5cbiAgYWNsR2VuUGFzcyhiaXRzPzogbnVtYmVyKSB7XG4gICAgaWYgKGJpdHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseTxCdWxrU3RyaW5nPihcIkFDTFwiLCBcIkdFTlBBU1NcIiwgYml0cyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNCdWxrUmVwbHk8QnVsa1N0cmluZz4oXCJBQ0xcIiwgXCJHRU5QQVNTXCIpO1xuICB9XG5cbiAgYWNsR2V0VXNlcih1c2VybmFtZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZyB8IEJ1bGtTdHJpbmdbXT4oXG4gICAgICBcIkFDTFwiLFxuICAgICAgXCJHRVRVU0VSXCIsXG4gICAgICB1c2VybmFtZSxcbiAgICApO1xuICB9XG5cbiAgYWNsSGVscCgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIkFDTFwiLCBcIkhFTFBcIik7XG4gIH1cblxuICBhY2xMaXN0KCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PEJ1bGtTdHJpbmc+KFwiQUNMXCIsIFwiTElTVFwiKTtcbiAgfVxuXG4gIGFjbExvYWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiQUNMXCIsIFwiTE9BRFwiKTtcbiAgfVxuXG4gIGFjbExvZyhjb3VudDogbnVtYmVyKTogUHJvbWlzZTxCdWxrU3RyaW5nW10+O1xuICBhY2xMb2cobW9kZTogQUNMTG9nTW9kZSk6IFByb21pc2U8U2ltcGxlU3RyaW5nPjtcbiAgYWNsTG9nKHBhcmFtOiBudW1iZXIgfCBBQ0xMb2dNb2RlKSB7XG4gICAgaWYgKHBhcmFtID09PSBcIlJFU0VUXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkFDTFwiLCBcIkxPR1wiLCBcIlJFU0VUXCIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIkFDTFwiLCBcIkxPR1wiLCBwYXJhbSk7XG4gIH1cblxuICBhY2xTYXZlKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkFDTFwiLCBcIlNBVkVcIik7XG4gIH1cblxuICBhY2xTZXRVc2VyKHVzZXJuYW1lOiBzdHJpbmcsIC4uLnJ1bGVzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkFDTFwiLCBcIlNFVFVTRVJcIiwgdXNlcm5hbWUsIC4uLnJ1bGVzKTtcbiAgfVxuXG4gIGFjbFVzZXJzKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PEJ1bGtTdHJpbmc+KFwiQUNMXCIsIFwiVVNFUlNcIik7XG4gIH1cblxuICBhY2xXaG9hbWkoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseTxCdWxrU3RyaW5nPihcIkFDTFwiLCBcIldIT0FNSVwiKTtcbiAgfVxuXG4gIGFwcGVuZChrZXk6IHN0cmluZywgdmFsdWU6IFJlZGlzVmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiQVBQRU5EXCIsIGtleSwgdmFsdWUpO1xuICB9XG5cbiAgYXV0aChwYXJhbTE6IFJlZGlzVmFsdWUsIHBhcmFtMj86IFJlZGlzVmFsdWUpIHtcbiAgICBpZiAocGFyYW0yICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkFVVEhcIiwgcGFyYW0xLCBwYXJhbTIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJBVVRIXCIsIHBhcmFtMSk7XG4gIH1cblxuICBiZ3Jld3JpdGVhb2YoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiQkdSRVdSSVRFQU9GXCIpO1xuICB9XG5cbiAgYmdzYXZlKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkJHU0FWRVwiKTtcbiAgfVxuXG4gIGJpdGNvdW50KGtleTogc3RyaW5nLCBzdGFydD86IG51bWJlciwgZW5kPzogbnVtYmVyKSB7XG4gICAgaWYgKHN0YXJ0ICE9PSB1bmRlZmluZWQgJiYgZW5kICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJCSVRDT1VOVFwiLCBrZXksIHN0YXJ0LCBlbmQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiQklUQ09VTlRcIiwga2V5KTtcbiAgfVxuXG4gIGJpdGZpZWxkKFxuICAgIGtleTogc3RyaW5nLFxuICAgIG9wdHM/OiBCaXRmaWVsZE9wdHMgfCBCaXRmaWVsZFdpdGhPdmVyZmxvd09wdHMsXG4gICkge1xuICAgIGNvbnN0IGFyZ3M6IChudW1iZXIgfCBzdHJpbmcpW10gPSBba2V5XTtcbiAgICBpZiAob3B0cz8uZ2V0KSB7XG4gICAgICBjb25zdCB7IHR5cGUsIG9mZnNldCB9ID0gb3B0cy5nZXQ7XG4gICAgICBhcmdzLnB1c2goXCJHRVRcIiwgdHlwZSwgb2Zmc2V0KTtcbiAgICB9XG4gICAgaWYgKG9wdHM/LnNldCkge1xuICAgICAgY29uc3QgeyB0eXBlLCBvZmZzZXQsIHZhbHVlIH0gPSBvcHRzLnNldDtcbiAgICAgIGFyZ3MucHVzaChcIlNFVFwiLCB0eXBlLCBvZmZzZXQsIHZhbHVlKTtcbiAgICB9XG4gICAgaWYgKG9wdHM/LmluY3JieSkge1xuICAgICAgY29uc3QgeyB0eXBlLCBvZmZzZXQsIGluY3JlbWVudCB9ID0gb3B0cy5pbmNyYnk7XG4gICAgICBhcmdzLnB1c2goXCJJTkNSQllcIiwgdHlwZSwgb2Zmc2V0LCBpbmNyZW1lbnQpO1xuICAgIH1cbiAgICBpZiAoKG9wdHMgYXMgQml0ZmllbGRXaXRoT3ZlcmZsb3dPcHRzKT8ub3ZlcmZsb3cpIHtcbiAgICAgIGFyZ3MucHVzaChcIk9WRVJGTE9XXCIsIChvcHRzIGFzIEJpdGZpZWxkV2l0aE92ZXJmbG93T3B0cykub3ZlcmZsb3cpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxJbnRlZ2VyPihcIkJJVEZJRUxEXCIsIC4uLmFyZ3MpO1xuICB9XG5cbiAgYml0b3Aob3BlcmF0aW9uOiBzdHJpbmcsIGRlc3RrZXk6IHN0cmluZywgLi4ua2V5czogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiQklUT1BcIiwgb3BlcmF0aW9uLCBkZXN0a2V5LCAuLi5rZXlzKTtcbiAgfVxuXG4gIGJpdHBvcyhrZXk6IHN0cmluZywgYml0OiBudW1iZXIsIHN0YXJ0PzogbnVtYmVyLCBlbmQ/OiBudW1iZXIpIHtcbiAgICBpZiAoc3RhcnQgIT09IHVuZGVmaW5lZCAmJiBlbmQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkJJVFBPU1wiLCBrZXksIGJpdCwgc3RhcnQsIGVuZCk7XG4gICAgfVxuICAgIGlmIChzdGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiQklUUE9TXCIsIGtleSwgYml0LCBzdGFydCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJCSVRQT1NcIiwga2V5LCBiaXQpO1xuICB9XG5cbiAgYmxwb3AodGltZW91dDogbnVtYmVyLCAuLi5rZXlzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5KFwiQkxQT1BcIiwgLi4ua2V5cywgdGltZW91dCkgYXMgUHJvbWlzZTxcbiAgICAgIFtCdWxrU3RyaW5nLCBCdWxrU3RyaW5nXSB8IFtdXG4gICAgPjtcbiAgfVxuXG4gIGJycG9wKHRpbWVvdXQ6IG51bWJlciwgLi4ua2V5czogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseShcIkJSUE9QXCIsIC4uLmtleXMsIHRpbWVvdXQpIGFzIFByb21pc2U8XG4gICAgICBbQnVsa1N0cmluZywgQnVsa1N0cmluZ10gfCBbXVxuICAgID47XG4gIH1cblxuICBicnBvcGxwdXNoKHNvdXJjZTogc3RyaW5nLCBkZXN0aW5hdGlvbjogc3RyaW5nLCB0aW1lb3V0OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQnVsa1JlcGx5KFwiQlJQT1BMUFVTSFwiLCBzb3VyY2UsIGRlc3RpbmF0aW9uLCB0aW1lb3V0KTtcbiAgfVxuXG4gIGJ6cG9wbWluKHRpbWVvdXQ6IG51bWJlciwgLi4ua2V5czogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseShcIkJaUE9QTUlOXCIsIC4uLmtleXMsIHRpbWVvdXQpIGFzIFByb21pc2U8XG4gICAgICBbQnVsa1N0cmluZywgQnVsa1N0cmluZywgQnVsa1N0cmluZ10gfCBbXVxuICAgID47XG4gIH1cblxuICBienBvcG1heCh0aW1lb3V0OiBudW1iZXIsIC4uLmtleXM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHkoXCJCWlBPUE1BWFwiLCAuLi5rZXlzLCB0aW1lb3V0KSBhcyBQcm9taXNlPFxuICAgICAgW0J1bGtTdHJpbmcsIEJ1bGtTdHJpbmcsIEJ1bGtTdHJpbmddIHwgW11cbiAgICA+O1xuICB9XG5cbiAgY2xpZW50Q2FjaGluZyhtb2RlOiBDbGllbnRDYWNoaW5nTW9kZSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkNMSUVOVFwiLCBcIkNBQ0hJTkdcIiwgbW9kZSk7XG4gIH1cblxuICBjbGllbnRHZXROYW1lKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNCdWxrUmVwbHkoXCJDTElFTlRcIiwgXCJHRVROQU1FXCIpO1xuICB9XG5cbiAgY2xpZW50R2V0UmVkaXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkNMSUVOVFwiLCBcIkdFVFJFRElSXCIpO1xuICB9XG5cbiAgY2xpZW50SUQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkNMSUVOVFwiLCBcIklEXCIpO1xuICB9XG5cbiAgY2xpZW50SW5mbygpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQnVsa1JlcGx5KFwiQ0xJRU5UXCIsIFwiSU5GT1wiKTtcbiAgfVxuXG4gIGNsaWVudEtpbGwob3B0czogQ2xpZW50S2lsbE9wdHMpIHtcbiAgICBjb25zdCBhcmdzOiAoc3RyaW5nIHwgbnVtYmVyKVtdID0gW107XG4gICAgaWYgKG9wdHMuYWRkcikge1xuICAgICAgYXJncy5wdXNoKFwiQUREUlwiLCBvcHRzLmFkZHIpO1xuICAgIH1cbiAgICBpZiAob3B0cy5sYWRkcikge1xuICAgICAgYXJncy5wdXNoKFwiTEFERFJcIiwgb3B0cy5sYWRkcik7XG4gICAgfVxuICAgIGlmIChvcHRzLmlkKSB7XG4gICAgICBhcmdzLnB1c2goXCJJRFwiLCBvcHRzLmlkKTtcbiAgICB9XG4gICAgaWYgKG9wdHMudHlwZSkge1xuICAgICAgYXJncy5wdXNoKFwiVFlQRVwiLCBvcHRzLnR5cGUpO1xuICAgIH1cbiAgICBpZiAob3B0cy51c2VyKSB7XG4gICAgICBhcmdzLnB1c2goXCJVU0VSXCIsIG9wdHMudXNlcik7XG4gICAgfVxuICAgIGlmIChvcHRzLnNraXBtZSkge1xuICAgICAgYXJncy5wdXNoKFwiU0tJUE1FXCIsIG9wdHMuc2tpcG1lKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkNMSUVOVFwiLCBcIktJTExcIiwgLi4uYXJncyk7XG4gIH1cblxuICBjbGllbnRMaXN0KG9wdHM/OiBDbGllbnRMaXN0T3B0cykge1xuICAgIGlmIChvcHRzICYmIG9wdHMudHlwZSAmJiBvcHRzLmlkcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib25seSBvbmUgb2YgYHR5cGVgIG9yIGBpZHNgIGNhbiBiZSBzcGVjaWZpZWRcIik7XG4gICAgfVxuICAgIGlmIChvcHRzICYmIG9wdHMudHlwZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseShcIkNMSUVOVFwiLCBcIkxJU1RcIiwgXCJUWVBFXCIsIG9wdHMudHlwZSk7XG4gICAgfVxuICAgIGlmIChvcHRzICYmIG9wdHMuaWRzKSB7XG4gICAgICByZXR1cm4gdGhpcy5leGVjQnVsa1JlcGx5KFwiQ0xJRU5UXCIsIFwiTElTVFwiLCBcIklEXCIsIC4uLm9wdHMuaWRzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseShcIkNMSUVOVFwiLCBcIkxJU1RcIik7XG4gIH1cblxuICBjbGllbnRQYXVzZSh0aW1lb3V0OiBudW1iZXIsIG1vZGU/OiBDbGllbnRQYXVzZU1vZGUpIHtcbiAgICBpZiAobW9kZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiQ0xJRU5UXCIsIFwiUEFVU0VcIiwgdGltZW91dCwgbW9kZSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkNMSUVOVFwiLCBcIlBBVVNFXCIsIHRpbWVvdXQpO1xuICB9XG5cbiAgY2xpZW50U2V0TmFtZShjb25uZWN0aW9uTmFtZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiQ0xJRU5UXCIsIFwiU0VUTkFNRVwiLCBjb25uZWN0aW9uTmFtZSk7XG4gIH1cblxuICBjbGllbnRUcmFja2luZyhvcHRzOiBDbGllbnRUcmFja2luZ09wdHMpIHtcbiAgICBjb25zdCBhcmdzOiAobnVtYmVyIHwgc3RyaW5nKVtdID0gW29wdHMubW9kZV07XG4gICAgaWYgKG9wdHMucmVkaXJlY3QpIHtcbiAgICAgIGFyZ3MucHVzaChcIlJFRElSRUNUXCIsIG9wdHMucmVkaXJlY3QpO1xuICAgIH1cbiAgICBpZiAob3B0cy5wcmVmaXhlcykge1xuICAgICAgb3B0cy5wcmVmaXhlcy5mb3JFYWNoKChwcmVmaXgpID0+IHtcbiAgICAgICAgYXJncy5wdXNoKFwiUFJFRklYXCIpO1xuICAgICAgICBhcmdzLnB1c2gocHJlZml4KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAob3B0cy5iY2FzdCkge1xuICAgICAgYXJncy5wdXNoKFwiQkNBU1RcIik7XG4gICAgfVxuICAgIGlmIChvcHRzLm9wdEluKSB7XG4gICAgICBhcmdzLnB1c2goXCJPUFRJTlwiKTtcbiAgICB9XG4gICAgaWYgKG9wdHMub3B0T3V0KSB7XG4gICAgICBhcmdzLnB1c2goXCJPUFRPVVRcIik7XG4gICAgfVxuICAgIGlmIChvcHRzLm5vTG9vcCkge1xuICAgICAgYXJncy5wdXNoKFwiTk9MT09QXCIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJDTElFTlRcIiwgXCJUUkFDS0lOR1wiLCAuLi5hcmdzKTtcbiAgfVxuXG4gIGNsaWVudFRyYWNraW5nSW5mbygpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseShcIkNMSUVOVFwiLCBcIlRSQUNLSU5HSU5GT1wiKTtcbiAgfVxuXG4gIGNsaWVudFVuYmxvY2soXG4gICAgaWQ6IG51bWJlcixcbiAgICBiZWhhdmlvdXI/OiBDbGllbnRVbmJsb2NraW5nQmVoYXZpb3VyLFxuICApOiBQcm9taXNlPEludGVnZXI+IHtcbiAgICBpZiAoYmVoYXZpb3VyKSB7XG4gICAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiQ0xJRU5UXCIsIFwiVU5CTE9DS1wiLCBpZCwgYmVoYXZpb3VyKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkNMSUVOVFwiLCBcIlVOQkxPQ0tcIiwgaWQpO1xuICB9XG5cbiAgY2xpZW50VW5wYXVzZSgpOiBQcm9taXNlPFNpbXBsZVN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkNMSUVOVFwiLCBcIlVOUEFVU0VcIik7XG4gIH1cblxuICBhc2tpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiQVNLSU5HXCIpO1xuICB9XG5cbiAgY2x1c3RlckFkZFNsb3RzKC4uLnNsb3RzOiBudW1iZXJbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkNMVVNURVJcIiwgXCJBRERTTE9UU1wiLCAuLi5zbG90cyk7XG4gIH1cblxuICBjbHVzdGVyQ291bnRGYWlsdXJlUmVwb3J0cyhub2RlSWQ6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJDTFVTVEVSXCIsIFwiQ09VTlQtRkFJTFVSRS1SRVBPUlRTXCIsIG5vZGVJZCk7XG4gIH1cblxuICBjbHVzdGVyQ291bnRLZXlzSW5TbG90KHNsb3Q6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJDTFVTVEVSXCIsIFwiQ09VTlRLRVlTSU5TTE9UXCIsIHNsb3QpO1xuICB9XG5cbiAgY2x1c3RlckRlbFNsb3RzKC4uLnNsb3RzOiBudW1iZXJbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkNMVVNURVJcIiwgXCJERUxTTE9UU1wiLCAuLi5zbG90cyk7XG4gIH1cblxuICBjbHVzdGVyRmFpbG92ZXIobW9kZT86IENsdXN0ZXJGYWlsb3Zlck1vZGUpIHtcbiAgICBpZiAobW9kZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiQ0xVU1RFUlwiLCBcIkZBSUxPVkVSXCIsIG1vZGUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJDTFVTVEVSXCIsIFwiRkFJTE9WRVJcIik7XG4gIH1cblxuICBjbHVzdGVyRmx1c2hTbG90cygpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJDTFVTVEVSXCIsIFwiRkxVU0hTTE9UU1wiKTtcbiAgfVxuXG4gIGNsdXN0ZXJGb3JnZXQobm9kZUlkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJDTFVTVEVSXCIsIFwiRk9SR0VUXCIsIG5vZGVJZCk7XG4gIH1cblxuICBjbHVzdGVyR2V0S2V5c0luU2xvdChzbG90OiBudW1iZXIsIGNvdW50OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcbiAgICAgIFwiQ0xVU1RFUlwiLFxuICAgICAgXCJHRVRLRVlTSU5TTE9UXCIsXG4gICAgICBzbG90LFxuICAgICAgY291bnQsXG4gICAgKTtcbiAgfVxuXG4gIGNsdXN0ZXJJbmZvKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkNMVVNURVJcIiwgXCJJTkZPXCIpO1xuICB9XG5cbiAgY2x1c3RlcktleVNsb3Qoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiQ0xVU1RFUlwiLCBcIktFWVNMT1RcIiwga2V5KTtcbiAgfVxuXG4gIGNsdXN0ZXJNZWV0KGlwOiBzdHJpbmcsIHBvcnQ6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkNMVVNURVJcIiwgXCJNRUVUXCIsIGlwLCBwb3J0KTtcbiAgfVxuXG4gIGNsdXN0ZXJNeUlEKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkNMVVNURVJcIiwgXCJNWUlEXCIpO1xuICB9XG5cbiAgY2x1c3Rlck5vZGVzKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNCdWxrUmVwbHk8QnVsa1N0cmluZz4oXCJDTFVTVEVSXCIsIFwiTk9ERVNcIik7XG4gIH1cblxuICBjbHVzdGVyUmVwbGljYXMobm9kZUlkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIkNMVVNURVJcIiwgXCJSRVBMSUNBU1wiLCBub2RlSWQpO1xuICB9XG5cbiAgY2x1c3RlclJlcGxpY2F0ZShub2RlSWQ6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkNMVVNURVJcIiwgXCJSRVBMSUNBVEVcIiwgbm9kZUlkKTtcbiAgfVxuXG4gIGNsdXN0ZXJSZXNldChtb2RlPzogQ2x1c3RlclJlc2V0TW9kZSkge1xuICAgIGlmIChtb2RlKSB7XG4gICAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJDTFVTVEVSXCIsIFwiUkVTRVRcIiwgbW9kZSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkNMVVNURVJcIiwgXCJSRVNFVFwiKTtcbiAgfVxuXG4gIGNsdXN0ZXJTYXZlQ29uZmlnKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkNMVVNURVJcIiwgXCJTQVZFQ09ORklHXCIpO1xuICB9XG5cbiAgY2x1c3RlclNldFNsb3QoXG4gICAgc2xvdDogbnVtYmVyLFxuICAgIHN1YmNvbW1hbmQ6IENsdXN0ZXJTZXRTbG90U3ViY29tbWFuZCxcbiAgICBub2RlSWQ/OiBzdHJpbmcsXG4gICkge1xuICAgIGlmIChub2RlSWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFxuICAgICAgICBcIkNMVVNURVJcIixcbiAgICAgICAgXCJTRVRTTE9UXCIsXG4gICAgICAgIHNsb3QsXG4gICAgICAgIHN1YmNvbW1hbmQsXG4gICAgICAgIG5vZGVJZCxcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkNMVVNURVJcIiwgXCJTRVRTTE9UXCIsIHNsb3QsIHN1YmNvbW1hbmQpO1xuICB9XG5cbiAgY2x1c3RlclNsYXZlcyhub2RlSWQ6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PEJ1bGtTdHJpbmc+KFwiQ0xVU1RFUlwiLCBcIlNMQVZFU1wiLCBub2RlSWQpO1xuICB9XG5cbiAgY2x1c3RlclNsb3RzKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5KFwiQ0xVU1RFUlwiLCBcIlNMT1RTXCIpO1xuICB9XG5cbiAgY29tbWFuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseShcIkNPTU1BTkRcIikgYXMgUHJvbWlzZTxcbiAgICAgIFtCdWxrU3RyaW5nLCBJbnRlZ2VyLCBCdWxrU3RyaW5nW10sIEludGVnZXIsIEludGVnZXIsIEludGVnZXJdW11cbiAgICA+O1xuICB9XG5cbiAgY29tbWFuZENvdW50KCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJDT01NQU5EXCIsIFwiQ09VTlRcIik7XG4gIH1cblxuICBjb21tYW5kR2V0S2V5cygpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIkNPTU1BTkRcIiwgXCJHRVRLRVlTXCIpO1xuICB9XG5cbiAgY29tbWFuZEluZm8oLi4uY29tbWFuZE5hbWVzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5KFwiQ09NTUFORFwiLCBcIklORk9cIiwgLi4uY29tbWFuZE5hbWVzKSBhcyBQcm9taXNlPFxuICAgICAgKFxuICAgICAgICB8IFtCdWxrU3RyaW5nLCBJbnRlZ2VyLCBCdWxrU3RyaW5nW10sIEludGVnZXIsIEludGVnZXIsIEludGVnZXJdXG4gICAgICAgIHwgQnVsa05pbFxuICAgICAgKVtdXG4gICAgPjtcbiAgfVxuXG4gIGNvbmZpZ0dldChwYXJhbWV0ZXI6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PEJ1bGtTdHJpbmc+KFwiQ09ORklHXCIsIFwiR0VUXCIsIHBhcmFtZXRlcik7XG4gIH1cblxuICBjb25maWdSZXNldFN0YXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiQ09ORklHXCIsIFwiUkVTRVRTVEFUXCIpO1xuICB9XG5cbiAgY29uZmlnUmV3cml0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJDT05GSUdcIiwgXCJSRVdSSVRFXCIpO1xuICB9XG5cbiAgY29uZmlnU2V0KHBhcmFtZXRlcjogc3RyaW5nLCB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiQ09ORklHXCIsIFwiU0VUXCIsIHBhcmFtZXRlciwgdmFsdWUpO1xuICB9XG5cbiAgZGJzaXplKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJEQlNJWkVcIik7XG4gIH1cblxuICBkZWJ1Z09iamVjdChrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkRFQlVHXCIsIFwiT0JKRUNUXCIsIGtleSk7XG4gIH1cblxuICBkZWJ1Z1NlZ2ZhdWx0KCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkRFQlVHXCIsIFwiU0VHRkFVTFRcIik7XG4gIH1cblxuICBkZWNyKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkRFQ1JcIiwga2V5KTtcbiAgfVxuXG4gIGRlY3JieShrZXk6IHN0cmluZywgZGVjcmVtZW50OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiREVDUkJZXCIsIGtleSwgZGVjcmVtZW50KTtcbiAgfVxuXG4gIGRlbCguLi5rZXlzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJERUxcIiwgLi4ua2V5cyk7XG4gIH1cblxuICBkaXNjYXJkKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkRJU0NBUkRcIik7XG4gIH1cblxuICBkdW1wKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0JpbmFyeVJlcGx5KFwiRFVNUFwiLCBrZXkpO1xuICB9XG5cbiAgZWNobyhtZXNzYWdlOiBSZWRpc1ZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseTxCdWxrU3RyaW5nPihcIkVDSE9cIiwgbWVzc2FnZSk7XG4gIH1cblxuICBldmFsKHNjcmlwdDogc3RyaW5nLCBrZXlzOiBzdHJpbmdbXSwgYXJnczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjUmVwbHkoXG4gICAgICBcIkVWQUxcIixcbiAgICAgIHNjcmlwdCxcbiAgICAgIGtleXMubGVuZ3RoLFxuICAgICAgLi4ua2V5cyxcbiAgICAgIC4uLmFyZ3MsXG4gICAgKTtcbiAgfVxuXG4gIGV2YWxzaGEoc2hhMTogc3RyaW5nLCBrZXlzOiBzdHJpbmdbXSwgYXJnczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjUmVwbHkoXG4gICAgICBcIkVWQUxTSEFcIixcbiAgICAgIHNoYTEsXG4gICAgICBrZXlzLmxlbmd0aCxcbiAgICAgIC4uLmtleXMsXG4gICAgICAuLi5hcmdzLFxuICAgICk7XG4gIH1cblxuICBleGVjKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5KFwiRVhFQ1wiKTtcbiAgfVxuXG4gIGV4aXN0cyguLi5rZXlzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJFWElTVFNcIiwgLi4ua2V5cyk7XG4gIH1cblxuICBleHBpcmUoa2V5OiBzdHJpbmcsIHNlY29uZHM6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJFWFBJUkVcIiwga2V5LCBzZWNvbmRzKTtcbiAgfVxuXG4gIGV4cGlyZWF0KGtleTogc3RyaW5nLCB0aW1lc3RhbXA6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJFWFBJUkVBVFwiLCBrZXksIHRpbWVzdGFtcCk7XG4gIH1cblxuICBmbHVzaGFsbChhc3luYz86IGJvb2xlYW4pIHtcbiAgICBpZiAoYXN5bmMpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkZMVVNIQUxMXCIsIFwiQVNZTkNcIik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkZMVVNIQUxMXCIpO1xuICB9XG5cbiAgZmx1c2hkYihhc3luYz86IGJvb2xlYW4pIHtcbiAgICBpZiAoYXN5bmMpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkZMVVNIREJcIiwgXCJBU1lOQ1wiKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiRkxVU0hEQlwiKTtcbiAgfVxuXG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIGdlb2FkZChrZXk6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSkge1xuICAgIGNvbnN0IGFyZ3M6IChzdHJpbmcgfCBudW1iZXIpW10gPSBba2V5XTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShwYXJhbXNbMF0pKSB7XG4gICAgICBhcmdzLnB1c2goLi4ucGFyYW1zLmZsYXRNYXAoKGUpID0+IGUpKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBwYXJhbXNbMF0gPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIGZvciAoY29uc3QgW21lbWJlciwgbG5nbGF0XSBvZiBPYmplY3QuZW50cmllcyhwYXJhbXNbMF0pKSB7XG4gICAgICAgIGFyZ3MucHVzaCguLi4obG5nbGF0IGFzIFtudW1iZXIsIG51bWJlcl0pLCBtZW1iZXIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBhcmdzLnB1c2goLi4ucGFyYW1zKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkdFT0FERFwiLCAuLi5hcmdzKTtcbiAgfVxuXG4gIGdlb2hhc2goa2V5OiBzdHJpbmcsIC4uLm1lbWJlcnM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsaz4oXCJHRU9IQVNIXCIsIGtleSwgLi4ubWVtYmVycyk7XG4gIH1cblxuICBnZW9wb3Moa2V5OiBzdHJpbmcsIC4uLm1lbWJlcnM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHkoXCJHRU9QT1NcIiwga2V5LCAuLi5tZW1iZXJzKSBhcyBQcm9taXNlPFxuICAgICAgKFtCdWxrU3RyaW5nLCBCdWxrU3RyaW5nXSB8IEJ1bGtOaWwpW11cbiAgICA+O1xuICB9XG5cbiAgZ2VvZGlzdChcbiAgICBrZXk6IHN0cmluZyxcbiAgICBtZW1iZXIxOiBzdHJpbmcsXG4gICAgbWVtYmVyMjogc3RyaW5nLFxuICAgIHVuaXQ/OiBHZW9Vbml0LFxuICApIHtcbiAgICBpZiAodW5pdCkge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseShcIkdFT0RJU1RcIiwga2V5LCBtZW1iZXIxLCBtZW1iZXIyLCB1bml0KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseShcIkdFT0RJU1RcIiwga2V5LCBtZW1iZXIxLCBtZW1iZXIyKTtcbiAgfVxuXG4gIGdlb3JhZGl1cyhcbiAgICBrZXk6IHN0cmluZyxcbiAgICBsb25naXR1ZGU6IG51bWJlcixcbiAgICBsYXRpdHVkZTogbnVtYmVyLFxuICAgIHJhZGl1czogbnVtYmVyLFxuICAgIHVuaXQ6IFwibVwiIHwgXCJrbVwiIHwgXCJmdFwiIHwgXCJtaVwiLFxuICAgIG9wdHM/OiBHZW9SYWRpdXNPcHRzLFxuICApIHtcbiAgICBjb25zdCBhcmdzID0gdGhpcy5wdXNoR2VvUmFkaXVzT3B0cyhcbiAgICAgIFtrZXksIGxvbmdpdHVkZSwgbGF0aXR1ZGUsIHJhZGl1cywgdW5pdF0sXG4gICAgICBvcHRzLFxuICAgICk7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHkoXCJHRU9SQURJVVNcIiwgLi4uYXJncyk7XG4gIH1cblxuICBnZW9yYWRpdXNieW1lbWJlcihcbiAgICBrZXk6IHN0cmluZyxcbiAgICBtZW1iZXI6IHN0cmluZyxcbiAgICByYWRpdXM6IG51bWJlcixcbiAgICB1bml0OiBHZW9Vbml0LFxuICAgIG9wdHM/OiBHZW9SYWRpdXNPcHRzLFxuICApIHtcbiAgICBjb25zdCBhcmdzID0gdGhpcy5wdXNoR2VvUmFkaXVzT3B0cyhba2V5LCBtZW1iZXIsIHJhZGl1cywgdW5pdF0sIG9wdHMpO1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5KFwiR0VPUkFESVVTQllNRU1CRVJcIiwgLi4uYXJncyk7XG4gIH1cblxuICBwcml2YXRlIHB1c2hHZW9SYWRpdXNPcHRzKFxuICAgIGFyZ3M6IChzdHJpbmcgfCBudW1iZXIpW10sXG4gICAgb3B0cz86IEdlb1JhZGl1c09wdHMsXG4gICkge1xuICAgIGlmIChvcHRzPy53aXRoQ29vcmQpIHtcbiAgICAgIGFyZ3MucHVzaChcIldJVEhDT09SRFwiKTtcbiAgICB9XG4gICAgaWYgKG9wdHM/LndpdGhEaXN0KSB7XG4gICAgICBhcmdzLnB1c2goXCJXSVRIRElTVFwiKTtcbiAgICB9XG4gICAgaWYgKG9wdHM/LndpdGhIYXNoKSB7XG4gICAgICBhcmdzLnB1c2goXCJXSVRISEFTSFwiKTtcbiAgICB9XG4gICAgaWYgKG9wdHM/LmNvdW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGFyZ3MucHVzaChvcHRzLmNvdW50KTtcbiAgICB9XG4gICAgaWYgKG9wdHM/LnNvcnQpIHtcbiAgICAgIGFyZ3MucHVzaChvcHRzLnNvcnQpO1xuICAgIH1cbiAgICBpZiAob3B0cz8uc3RvcmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYXJncy5wdXNoKG9wdHMuc3RvcmUpO1xuICAgIH1cbiAgICBpZiAob3B0cz8uc3RvcmVEaXN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGFyZ3MucHVzaChvcHRzLnN0b3JlRGlzdCk7XG4gICAgfVxuICAgIHJldHVybiBhcmdzO1xuICB9XG5cbiAgZ2V0KGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseShcIkdFVFwiLCBrZXkpO1xuICB9XG5cbiAgZ2V0Yml0KGtleTogc3RyaW5nLCBvZmZzZXQ6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJHRVRCSVRcIiwga2V5LCBvZmZzZXQpO1xuICB9XG5cbiAgZ2V0cmFuZ2Uoa2V5OiBzdHJpbmcsIHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseTxCdWxrU3RyaW5nPihcIkdFVFJBTkdFXCIsIGtleSwgc3RhcnQsIGVuZCk7XG4gIH1cblxuICBnZXRzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBSZWRpc1ZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseShcIkdFVFNFVFwiLCBrZXksIHZhbHVlKTtcbiAgfVxuXG4gIGhkZWwoa2V5OiBzdHJpbmcsIC4uLmZpZWxkczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiSERFTFwiLCBrZXksIC4uLmZpZWxkcyk7XG4gIH1cblxuICBoZXhpc3RzKGtleTogc3RyaW5nLCBmaWVsZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkhFWElTVFNcIiwga2V5LCBmaWVsZCk7XG4gIH1cblxuICBoZ2V0KGtleTogc3RyaW5nLCBmaWVsZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseShcIkhHRVRcIiwga2V5LCBmaWVsZCk7XG4gIH1cblxuICBoZ2V0YWxsKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZz4oXCJIR0VUQUxMXCIsIGtleSk7XG4gIH1cblxuICBoaW5jcmJ5KGtleTogc3RyaW5nLCBmaWVsZDogc3RyaW5nLCBpbmNyZW1lbnQ6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJISU5DUkJZXCIsIGtleSwgZmllbGQsIGluY3JlbWVudCk7XG4gIH1cblxuICBoaW5jcmJ5ZmxvYXQoa2V5OiBzdHJpbmcsIGZpZWxkOiBzdHJpbmcsIGluY3JlbWVudDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseTxCdWxrU3RyaW5nPihcbiAgICAgIFwiSElOQ1JCWUZMT0FUXCIsXG4gICAgICBrZXksXG4gICAgICBmaWVsZCxcbiAgICAgIGluY3JlbWVudCxcbiAgICApO1xuICB9XG5cbiAgaGtleXMoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIkhLRVlTXCIsIGtleSk7XG4gIH1cblxuICBobGVuKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkhMRU5cIiwga2V5KTtcbiAgfVxuXG4gIGhtZ2V0KGtleTogc3RyaW5nLCAuLi5maWVsZHM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsaz4oXCJITUdFVFwiLCBrZXksIC4uLmZpZWxkcyk7XG4gIH1cblxuICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICBobXNldChrZXk6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSkge1xuICAgIGNvbnN0IGFyZ3MgPSBba2V5XSBhcyBSZWRpc1ZhbHVlW107XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocGFyYW1zWzBdKSkge1xuICAgICAgYXJncy5wdXNoKC4uLnBhcmFtcy5mbGF0TWFwKChlKSA9PiBlKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcGFyYW1zWzBdID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBmb3IgKGNvbnN0IFtmaWVsZCwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHBhcmFtc1swXSkpIHtcbiAgICAgICAgYXJncy5wdXNoKGZpZWxkLCB2YWx1ZSBhcyBSZWRpc1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYXJncy5wdXNoKC4uLnBhcmFtcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkhNU0VUXCIsIC4uLmFyZ3MpO1xuICB9XG5cbiAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgaHNldChrZXk6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSkge1xuICAgIGNvbnN0IGFyZ3MgPSBba2V5XSBhcyBSZWRpc1ZhbHVlW107XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocGFyYW1zWzBdKSkge1xuICAgICAgYXJncy5wdXNoKC4uLnBhcmFtcy5mbGF0TWFwKChlKSA9PiBlKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcGFyYW1zWzBdID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBmb3IgKGNvbnN0IFtmaWVsZCwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHBhcmFtc1swXSkpIHtcbiAgICAgICAgYXJncy5wdXNoKGZpZWxkLCB2YWx1ZSBhcyBSZWRpc1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYXJncy5wdXNoKC4uLnBhcmFtcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJIU0VUXCIsIC4uLmFyZ3MpO1xuICB9XG5cbiAgaHNldG54KGtleTogc3RyaW5nLCBmaWVsZDogc3RyaW5nLCB2YWx1ZTogUmVkaXNWYWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJIU0VUTlhcIiwga2V5LCBmaWVsZCwgdmFsdWUpO1xuICB9XG5cbiAgaHN0cmxlbihrZXk6IHN0cmluZywgZmllbGQ6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJIU1RSTEVOXCIsIGtleSwgZmllbGQpO1xuICB9XG5cbiAgaHZhbHMoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIkhWQUxTXCIsIGtleSk7XG4gIH1cblxuICBpbmNyKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIklOQ1JcIiwga2V5KTtcbiAgfVxuXG4gIGluY3JieShrZXk6IHN0cmluZywgaW5jcmVtZW50OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiSU5DUkJZXCIsIGtleSwgaW5jcmVtZW50KTtcbiAgfVxuXG4gIGluY3JieWZsb2F0KGtleTogc3RyaW5nLCBpbmNyZW1lbnQ6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmV4ZWNCdWxrUmVwbHk8QnVsa1N0cmluZz4oXCJJTkNSQllGTE9BVFwiLCBrZXksIGluY3JlbWVudCk7XG4gIH1cblxuICBpbmZvKHNlY3Rpb24/OiBzdHJpbmcpIHtcbiAgICBpZiAoc2VjdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJJTkZPXCIsIHNlY3Rpb24pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJJTkZPXCIpO1xuICB9XG5cbiAga2V5cyhwYXR0ZXJuOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIktFWVNcIiwgcGF0dGVybik7XG4gIH1cblxuICBsYXN0c2F2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiTEFTVFNBVkVcIik7XG4gIH1cblxuICBsaW5kZXgoa2V5OiBzdHJpbmcsIGluZGV4OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQnVsa1JlcGx5KFwiTElOREVYXCIsIGtleSwgaW5kZXgpO1xuICB9XG5cbiAgbGluc2VydChrZXk6IHN0cmluZywgbG9jOiBMSW5zZXJ0TG9jYXRpb24sIHBpdm90OiBzdHJpbmcsIHZhbHVlOiBSZWRpc1ZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkxJTlNFUlRcIiwga2V5LCBsb2MsIHBpdm90LCB2YWx1ZSk7XG4gIH1cblxuICBsbGVuKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkxMRU5cIiwga2V5KTtcbiAgfVxuXG4gIGxwb3Aoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQnVsa1JlcGx5KFwiTFBPUFwiLCBrZXkpO1xuICB9XG5cbiAgbHBvcyhcbiAgICBrZXk6IHN0cmluZyxcbiAgICBlbGVtZW50OiBSZWRpc1ZhbHVlLFxuICAgIG9wdHM/OiBMUG9zT3B0cyxcbiAgKTogUHJvbWlzZTxJbnRlZ2VyIHwgQnVsa05pbD47XG5cbiAgbHBvcyhcbiAgICBrZXk6IHN0cmluZyxcbiAgICBlbGVtZW50OiBSZWRpc1ZhbHVlLFxuICAgIG9wdHM6IExQb3NXaXRoQ291bnRPcHRzLFxuICApOiBQcm9taXNlPEludGVnZXJbXT47XG5cbiAgbHBvcyhcbiAgICBrZXk6IHN0cmluZyxcbiAgICBlbGVtZW50OiBSZWRpc1ZhbHVlLFxuICAgIG9wdHM/OiBMUG9zT3B0cyB8IExQb3NXaXRoQ291bnRPcHRzLFxuICApOiBQcm9taXNlPEludGVnZXIgfCBCdWxrTmlsIHwgSW50ZWdlcltdPiB7XG4gICAgY29uc3QgYXJncyA9IFtlbGVtZW50XTtcbiAgICBpZiAob3B0cz8ucmFuayAhPSBudWxsKSB7XG4gICAgICBhcmdzLnB1c2goXCJSQU5LXCIsIFN0cmluZyhvcHRzLnJhbmspKTtcbiAgICB9XG5cbiAgICBpZiAob3B0cz8uY291bnQgIT0gbnVsbCkge1xuICAgICAgYXJncy5wdXNoKFwiQ09VTlRcIiwgU3RyaW5nKG9wdHMuY291bnQpKTtcbiAgICB9XG5cbiAgICBpZiAob3B0cz8ubWF4bGVuICE9IG51bGwpIHtcbiAgICAgIGFyZ3MucHVzaChcIk1BWExFTlwiLCBTdHJpbmcob3B0cy5tYXhsZW4pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb3B0cz8uY291bnQgPT0gbnVsbFxuICAgICAgPyB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJMUE9TXCIsIGtleSwgLi4uYXJncylcbiAgICAgIDogdGhpcy5leGVjQXJyYXlSZXBseTxJbnRlZ2VyPihcIkxQT1NcIiwga2V5LCAuLi5hcmdzKTtcbiAgfVxuXG4gIGxwdXNoKGtleTogc3RyaW5nLCAuLi5lbGVtZW50czogUmVkaXNWYWx1ZVtdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkxQVVNIXCIsIGtleSwgLi4uZWxlbWVudHMpO1xuICB9XG5cbiAgbHB1c2h4KGtleTogc3RyaW5nLCAuLi5lbGVtZW50czogUmVkaXNWYWx1ZVtdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIkxQVVNIWFwiLCBrZXksIC4uLmVsZW1lbnRzKTtcbiAgfVxuXG4gIGxyYW5nZShrZXk6IHN0cmluZywgc3RhcnQ6IG51bWJlciwgc3RvcDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZz4oXCJMUkFOR0VcIiwga2V5LCBzdGFydCwgc3RvcCk7XG4gIH1cblxuICBscmVtKGtleTogc3RyaW5nLCBjb3VudDogbnVtYmVyLCBlbGVtZW50OiBzdHJpbmcgfCBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiTFJFTVwiLCBrZXksIGNvdW50LCBlbGVtZW50KTtcbiAgfVxuXG4gIGxzZXQoa2V5OiBzdHJpbmcsIGluZGV4OiBudW1iZXIsIGVsZW1lbnQ6IHN0cmluZyB8IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIkxTRVRcIiwga2V5LCBpbmRleCwgZWxlbWVudCk7XG4gIH1cblxuICBsdHJpbShrZXk6IHN0cmluZywgc3RhcnQ6IG51bWJlciwgc3RvcDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiTFRSSU1cIiwga2V5LCBzdGFydCwgc3RvcCk7XG4gIH1cblxuICBtZW1vcnlEb2N0b3IoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseTxCdWxrU3RyaW5nPihcIk1FTU9SWVwiLCBcIkRPQ1RPUlwiKTtcbiAgfVxuXG4gIG1lbW9yeUhlbHAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZz4oXCJNRU1PUllcIiwgXCJIRUxQXCIpO1xuICB9XG5cbiAgbWVtb3J5TWFsbG9jU3RhdHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseTxCdWxrU3RyaW5nPihcIk1FTU9SWVwiLCBcIk1BTExPQ1wiLCBcIlNUQVRTXCIpO1xuICB9XG5cbiAgbWVtb3J5UHVyZ2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiTUVNT1JZXCIsIFwiUFVSR0VcIik7XG4gIH1cblxuICBtZW1vcnlTdGF0cygpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseShcIk1FTU9SWVwiLCBcIlNUQVRTXCIpO1xuICB9XG5cbiAgbWVtb3J5VXNhZ2Uoa2V5OiBzdHJpbmcsIG9wdHM/OiBNZW1vcnlVc2FnZU9wdHMpIHtcbiAgICBjb25zdCBhcmdzOiAobnVtYmVyIHwgc3RyaW5nKVtdID0gW2tleV07XG4gICAgaWYgKG9wdHM/LnNhbXBsZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYXJncy5wdXNoKFwiU0FNUExFU1wiLCBvcHRzLnNhbXBsZXMpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiTUVNT1JZXCIsIFwiVVNBR0VcIiwgLi4uYXJncyk7XG4gIH1cblxuICBtZ2V0KC4uLmtleXM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsaz4oXCJNR0VUXCIsIC4uLmtleXMpO1xuICB9XG5cbiAgbWlncmF0ZShcbiAgICBob3N0OiBzdHJpbmcsXG4gICAgcG9ydDogbnVtYmVyLFxuICAgIGtleTogc3RyaW5nLFxuICAgIGRlc3RpbmF0aW9uREI6IHN0cmluZyxcbiAgICB0aW1lb3V0OiBudW1iZXIsXG4gICAgb3B0cz86IE1pZ3JhdGVPcHRzLFxuICApIHtcbiAgICBjb25zdCBhcmdzID0gW2hvc3QsIHBvcnQsIGtleSwgZGVzdGluYXRpb25EQiwgdGltZW91dF07XG4gICAgaWYgKG9wdHM/LmNvcHkpIHtcbiAgICAgIGFyZ3MucHVzaChcIkNPUFlcIik7XG4gICAgfVxuICAgIGlmIChvcHRzPy5yZXBsYWNlKSB7XG4gICAgICBhcmdzLnB1c2goXCJSRVBMQUNFXCIpO1xuICAgIH1cbiAgICBpZiAob3B0cz8uYXV0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhcmdzLnB1c2goXCJBVVRIXCIsIG9wdHMuYXV0aCk7XG4gICAgfVxuICAgIGlmIChvcHRzPy5rZXlzKSB7XG4gICAgICBhcmdzLnB1c2goXCJLRVlTXCIsIC4uLm9wdHMua2V5cyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIk1JR1JBVEVcIiwgLi4uYXJncyk7XG4gIH1cblxuICBtb2R1bGVMaXN0KCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PEJ1bGtTdHJpbmc+KFwiTU9EVUxFXCIsIFwiTElTVFwiKTtcbiAgfVxuXG4gIG1vZHVsZUxvYWQocGF0aDogc3RyaW5nLCAuLi5hcmdzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIk1PRFVMRVwiLCBcIkxPQURcIiwgcGF0aCwgLi4uYXJncyk7XG4gIH1cblxuICBtb2R1bGVVbmxvYWQobmFtZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiTU9EVUxFXCIsIFwiVU5MT0FEXCIsIG5hbWUpO1xuICB9XG5cbiAgbW9uaXRvcigpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJub3Qgc3VwcG9ydGVkIHlldFwiKTtcbiAgfVxuXG4gIG1vdmUoa2V5OiBzdHJpbmcsIGRiOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiTU9WRVwiLCBrZXksIGRiKTtcbiAgfVxuXG4gIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gIG1zZXQoLi4ucGFyYW1zOiBhbnlbXSkge1xuICAgIGNvbnN0IGFyZ3M6IFJlZGlzVmFsdWVbXSA9IFtdO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHBhcmFtc1swXSkpIHtcbiAgICAgIGFyZ3MucHVzaCguLi5wYXJhbXMuZmxhdE1hcCgoZSkgPT4gZSkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHBhcmFtc1swXSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMocGFyYW1zWzBdKSkge1xuICAgICAgICBhcmdzLnB1c2goa2V5LCB2YWx1ZSBhcyBSZWRpc1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYXJncy5wdXNoKC4uLnBhcmFtcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIk1TRVRcIiwgLi4uYXJncyk7XG4gIH1cblxuICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICBtc2V0bngoLi4ucGFyYW1zOiBhbnlbXSkge1xuICAgIGNvbnN0IGFyZ3M6IFJlZGlzVmFsdWVbXSA9IFtdO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHBhcmFtc1swXSkpIHtcbiAgICAgIGFyZ3MucHVzaCguLi5wYXJhbXMuZmxhdE1hcCgoZSkgPT4gZSkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHBhcmFtc1swXSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMocGFyYW1zWzBdKSkge1xuICAgICAgICBhcmdzLnB1c2goa2V5LCB2YWx1ZSBhcyBSZWRpc1ZhbHVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYXJncy5wdXNoKC4uLnBhcmFtcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJNU0VUTlhcIiwgLi4uYXJncyk7XG4gIH1cblxuICBtdWx0aSgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJNVUxUSVwiKTtcbiAgfVxuXG4gIG9iamVjdEVuY29kaW5nKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseShcIk9CSkVDVFwiLCBcIkVOQ09ESU5HXCIsIGtleSk7XG4gIH1cblxuICBvYmplY3RGcmVxKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJPck5pbFJlcGx5KFwiT0JKRUNUXCIsIFwiRlJFUVwiLCBrZXkpO1xuICB9XG5cbiAgb2JqZWN0SGVscCgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIk9CSkVDVFwiLCBcIkhFTFBcIik7XG4gIH1cblxuICBvYmplY3RJZGxldGltZShrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyT3JOaWxSZXBseShcIk9CSkVDVFwiLCBcIklETEVUSU1FXCIsIGtleSk7XG4gIH1cblxuICBvYmplY3RSZWZDb3VudChrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyT3JOaWxSZXBseShcIk9CSkVDVFwiLCBcIlJFRkNPVU5UXCIsIGtleSk7XG4gIH1cblxuICBwZXJzaXN0KGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIlBFUlNJU1RcIiwga2V5KTtcbiAgfVxuXG4gIHBleHBpcmUoa2V5OiBzdHJpbmcsIG1pbGxpc2Vjb25kczogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIlBFWFBJUkVcIiwga2V5LCBtaWxsaXNlY29uZHMpO1xuICB9XG5cbiAgcGV4cGlyZWF0KGtleTogc3RyaW5nLCBtaWxsaXNlY29uZHNUaW1lc3RhbXA6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJQRVhQSVJFQVRcIiwga2V5LCBtaWxsaXNlY29uZHNUaW1lc3RhbXApO1xuICB9XG5cbiAgcGZhZGQoa2V5OiBzdHJpbmcsIC4uLmVsZW1lbnRzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJQRkFERFwiLCBrZXksIC4uLmVsZW1lbnRzKTtcbiAgfVxuXG4gIHBmY291bnQoLi4ua2V5czogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiUEZDT1VOVFwiLCAuLi5rZXlzKTtcbiAgfVxuXG4gIHBmbWVyZ2UoZGVzdGtleTogc3RyaW5nLCAuLi5zb3VyY2VrZXlzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIlBGTUVSR0VcIiwgZGVzdGtleSwgLi4uc291cmNla2V5cyk7XG4gIH1cblxuICBwaW5nKG1lc3NhZ2U/OiBSZWRpc1ZhbHVlKSB7XG4gICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgIHJldHVybiB0aGlzLmV4ZWNCdWxrUmVwbHk8QnVsa1N0cmluZz4oXCJQSU5HXCIsIG1lc3NhZ2UpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJQSU5HXCIpO1xuICB9XG5cbiAgcHNldGV4KGtleTogc3RyaW5nLCBtaWxsaXNlY29uZHM6IG51bWJlciwgdmFsdWU6IFJlZGlzVmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJQU0VURVhcIiwga2V5LCBtaWxsaXNlY29uZHMsIHZhbHVlKTtcbiAgfVxuXG4gIHB1Ymxpc2goY2hhbm5lbDogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiUFVCTElTSFwiLCBjaGFubmVsLCBtZXNzYWdlKTtcbiAgfVxuXG4gIHN1YnNjcmliZTxUTWVzc2FnZSBleHRlbmRzIHN0cmluZyB8IHN0cmluZ1tdID0gc3RyaW5nPihcbiAgICAuLi5jaGFubmVsczogc3RyaW5nW11cbiAgKSB7XG4gICAgcmV0dXJuIHN1YnNjcmliZTxUTWVzc2FnZT4odGhpcy5leGVjdXRvciwgLi4uY2hhbm5lbHMpO1xuICB9XG5cbiAgcHN1YnNjcmliZTxUTWVzc2FnZSBleHRlbmRzIHN0cmluZyB8IHN0cmluZ1tdID0gc3RyaW5nPihcbiAgICAuLi5wYXR0ZXJuczogc3RyaW5nW11cbiAgKSB7XG4gICAgcmV0dXJuIHBzdWJzY3JpYmU8VE1lc3NhZ2U+KHRoaXMuZXhlY3V0b3IsIC4uLnBhdHRlcm5zKTtcbiAgfVxuXG4gIHB1YnN1YkNoYW5uZWxzKHBhdHRlcm4/OiBzdHJpbmcpIHtcbiAgICBpZiAocGF0dGVybiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIlBVQlNVQlwiLCBcIkNIQU5ORUxTXCIsIHBhdHRlcm4pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIlBVQlNVQlwiLCBcIkNIQU5ORUxTXCIpO1xuICB9XG5cbiAgcHVic3ViTnVtcGF0KCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJQVUJTVUJcIiwgXCJOVU1QQVRcIik7XG4gIH1cblxuICBwdWJzdWJOdW1zdWIoLi4uY2hhbm5lbHM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZyB8IEludGVnZXI+KFxuICAgICAgXCJQVUJTVUJcIixcbiAgICAgIFwiTlVNU1VCU1wiLFxuICAgICAgLi4uY2hhbm5lbHMsXG4gICAgKTtcbiAgfVxuXG4gIHB0dGwoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiUFRUTFwiLCBrZXkpO1xuICB9XG5cbiAgcXVpdCgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJRVUlUXCIpLmZpbmFsbHkoKCkgPT4gdGhpcy5jbG9zZSgpKTtcbiAgfVxuXG4gIHJhbmRvbWtleSgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQnVsa1JlcGx5KFwiUkFORE9NS0VZXCIpO1xuICB9XG5cbiAgcmVhZG9ubHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiUkVBRE9OTFlcIik7XG4gIH1cblxuICByZWFkd3JpdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiUkVBRFdSSVRFXCIpO1xuICB9XG5cbiAgcmVuYW1lKGtleTogc3RyaW5nLCBuZXdrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIlJFTkFNRVwiLCBrZXksIG5ld2tleSk7XG4gIH1cblxuICByZW5hbWVueChrZXk6IHN0cmluZywgbmV3a2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiUkVOQU1FTlhcIiwga2V5LCBuZXdrZXkpO1xuICB9XG5cbiAgcmVzdG9yZShcbiAgICBrZXk6IHN0cmluZyxcbiAgICB0dGw6IG51bWJlcixcbiAgICBzZXJpYWxpemVkVmFsdWU6IEJpbmFyeSxcbiAgICBvcHRzPzogUmVzdG9yZU9wdHMsXG4gICkge1xuICAgIGNvbnN0IGFyZ3MgPSBba2V5LCB0dGwsIHNlcmlhbGl6ZWRWYWx1ZV07XG4gICAgaWYgKG9wdHM/LnJlcGxhY2UpIHtcbiAgICAgIGFyZ3MucHVzaChcIlJFUExBQ0VcIik7XG4gICAgfVxuICAgIGlmIChvcHRzPy5hYnN0dGwpIHtcbiAgICAgIGFyZ3MucHVzaChcIkFCU1RUTFwiKTtcbiAgICB9XG4gICAgaWYgKG9wdHM/LmlkbGV0aW1lICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGFyZ3MucHVzaChcIklETEVUSU1FXCIsIG9wdHMuaWRsZXRpbWUpO1xuICAgIH1cbiAgICBpZiAob3B0cz8uZnJlcSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhcmdzLnB1c2goXCJGUkVRXCIsIG9wdHMuZnJlcSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIlJFU1RPUkVcIiwgLi4uYXJncyk7XG4gIH1cblxuICByb2xlKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5KFwiUk9MRVwiKSBhcyBQcm9taXNlPFxuICAgICAgfCBbXCJtYXN0ZXJcIiwgSW50ZWdlciwgQnVsa1N0cmluZ1tdW11dXG4gICAgICB8IFtcInNsYXZlXCIsIEJ1bGtTdHJpbmcsIEludGVnZXIsIEJ1bGtTdHJpbmcsIEludGVnZXJdXG4gICAgICB8IFtcInNlbnRpbmVsXCIsIEJ1bGtTdHJpbmdbXV1cbiAgICA+O1xuICB9XG5cbiAgcnBvcChrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNCdWxrUmVwbHkoXCJSUE9QXCIsIGtleSk7XG4gIH1cblxuICBycG9wbHB1c2goc291cmNlOiBzdHJpbmcsIGRlc3RpbmF0aW9uOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQnVsa1JlcGx5KFwiUlBPUExQVVNIXCIsIHNvdXJjZSwgZGVzdGluYXRpb24pO1xuICB9XG5cbiAgcnB1c2goa2V5OiBzdHJpbmcsIC4uLmVsZW1lbnRzOiBSZWRpc1ZhbHVlW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiUlBVU0hcIiwga2V5LCAuLi5lbGVtZW50cyk7XG4gIH1cblxuICBycHVzaHgoa2V5OiBzdHJpbmcsIC4uLmVsZW1lbnRzOiBSZWRpc1ZhbHVlW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiUlBVU0hYXCIsIGtleSwgLi4uZWxlbWVudHMpO1xuICB9XG5cbiAgc2FkZChrZXk6IHN0cmluZywgLi4ubWVtYmVyczogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiU0FERFwiLCBrZXksIC4uLm1lbWJlcnMpO1xuICB9XG5cbiAgc2F2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJTQVZFXCIpO1xuICB9XG5cbiAgc2NhcmQoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiU0NBUkRcIiwga2V5KTtcbiAgfVxuXG4gIHNjcmlwdERlYnVnKG1vZGU6IFNjcmlwdERlYnVnTW9kZSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIlNDUklQVFwiLCBcIkRFQlVHXCIsIG1vZGUpO1xuICB9XG5cbiAgc2NyaXB0RXhpc3RzKC4uLnNoYTFzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PEludGVnZXI+KFwiU0NSSVBUXCIsIFwiRVhJU1RTXCIsIC4uLnNoYTFzKTtcbiAgfVxuXG4gIHNjcmlwdEZsdXNoKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIlNDUklQVFwiLCBcIkZMVVNIXCIpO1xuICB9XG5cbiAgc2NyaXB0S2lsbCgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJTQ1JJUFRcIiwgXCJLSUxMXCIpO1xuICB9XG5cbiAgc2NyaXB0TG9hZChzY3JpcHQ6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIlNDUklQVFwiLCBcIkxPQURcIiwgc2NyaXB0KTtcbiAgfVxuXG4gIHNkaWZmKC4uLmtleXM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZz4oXCJTRElGRlwiLCAuLi5rZXlzKTtcbiAgfVxuXG4gIHNkaWZmc3RvcmUoZGVzdGluYXRpb246IHN0cmluZywgLi4ua2V5czogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiU0RJRkZTVE9SRVwiLCBkZXN0aW5hdGlvbiwgLi4ua2V5cyk7XG4gIH1cblxuICBzZWxlY3QoaW5kZXg6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIlNFTEVDVFwiLCBpbmRleCk7XG4gIH1cblxuICBzZXQoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgdmFsdWU6IFJlZGlzVmFsdWUsXG4gICAgb3B0cz86IFNldE9wdHMsXG4gICk6IFByb21pc2U8U2ltcGxlU3RyaW5nPjtcbiAgc2V0KFxuICAgIGtleTogc3RyaW5nLFxuICAgIHZhbHVlOiBSZWRpc1ZhbHVlLFxuICAgIG9wdHM/OiBTZXRXaXRoTW9kZU9wdHMsXG4gICk6IFByb21pc2U8U2ltcGxlU3RyaW5nIHwgQnVsa05pbD47XG4gIHNldChcbiAgICBrZXk6IHN0cmluZyxcbiAgICB2YWx1ZTogUmVkaXNWYWx1ZSxcbiAgICBvcHRzPzogU2V0T3B0cyB8IFNldFdpdGhNb2RlT3B0cyxcbiAgKSB7XG4gICAgY29uc3QgYXJnczogUmVkaXNWYWx1ZVtdID0gW2tleSwgdmFsdWVdO1xuICAgIGlmIChvcHRzPy5leCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhcmdzLnB1c2goXCJFWFwiLCBvcHRzLmV4KTtcbiAgICB9IGVsc2UgaWYgKG9wdHM/LnB4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGFyZ3MucHVzaChcIlBYXCIsIG9wdHMucHgpO1xuICAgIH1cbiAgICBpZiAob3B0cz8ua2VlcHR0bCkge1xuICAgICAgYXJncy5wdXNoKFwiS0VFUFRUTFwiKTtcbiAgICB9XG4gICAgaWYgKChvcHRzIGFzIFNldFdpdGhNb2RlT3B0cyk/Lm1vZGUpIHtcbiAgICAgIGFyZ3MucHVzaCgob3B0cyBhcyBTZXRXaXRoTW9kZU9wdHMpLm1vZGUpO1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c09yTmlsUmVwbHkoXCJTRVRcIiwgLi4uYXJncyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIlNFVFwiLCAuLi5hcmdzKTtcbiAgfVxuXG4gIHNldGJpdChrZXk6IHN0cmluZywgb2Zmc2V0OiBudW1iZXIsIHZhbHVlOiBSZWRpc1ZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIlNFVEJJVFwiLCBrZXksIG9mZnNldCwgdmFsdWUpO1xuICB9XG5cbiAgc2V0ZXgoa2V5OiBzdHJpbmcsIHNlY29uZHM6IG51bWJlciwgdmFsdWU6IFJlZGlzVmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJTRVRFWFwiLCBrZXksIHNlY29uZHMsIHZhbHVlKTtcbiAgfVxuXG4gIHNldG54KGtleTogc3RyaW5nLCB2YWx1ZTogUmVkaXNWYWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJTRVROWFwiLCBrZXksIHZhbHVlKTtcbiAgfVxuXG4gIHNldHJhbmdlKGtleTogc3RyaW5nLCBvZmZzZXQ6IG51bWJlciwgdmFsdWU6IFJlZGlzVmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiU0VUUkFOR0VcIiwga2V5LCBvZmZzZXQsIHZhbHVlKTtcbiAgfVxuXG4gIHNodXRkb3duKG1vZGU/OiBTaHV0ZG93bk1vZGUpIHtcbiAgICBpZiAobW9kZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiU0hVVERPV05cIiwgbW9kZSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIlNIVVRET1dOXCIpO1xuICB9XG5cbiAgc2ludGVyKC4uLmtleXM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZz4oXCJTSU5URVJcIiwgLi4ua2V5cyk7XG4gIH1cblxuICBzaW50ZXJzdG9yZShkZXN0aW5hdGlvbjogc3RyaW5nLCAuLi5rZXlzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJTSU5URVJTVE9SRVwiLCBkZXN0aW5hdGlvbiwgLi4ua2V5cyk7XG4gIH1cblxuICBzaXNtZW1iZXIoa2V5OiBzdHJpbmcsIG1lbWJlcjogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIlNJU01FTUJFUlwiLCBrZXksIG1lbWJlcik7XG4gIH1cblxuICBzbGF2ZW9mKGhvc3Q6IHN0cmluZywgcG9ydDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiU0xBVkVPRlwiLCBob3N0LCBwb3J0KTtcbiAgfVxuXG4gIHNsYXZlb2ZOb09uZSgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJTTEFWRU9GXCIsIFwiTk8gT05FXCIpO1xuICB9XG5cbiAgcmVwbGljYW9mKGhvc3Q6IHN0cmluZywgcG9ydDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiUkVQTElDQU9GXCIsIGhvc3QsIHBvcnQpO1xuICB9XG5cbiAgcmVwbGljYW9mTm9PbmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFwiUkVQTElDQU9GXCIsIFwiTk8gT05FXCIpO1xuICB9XG5cbiAgc2xvd2xvZyhzdWJjb21tYW5kOiBzdHJpbmcsIC4uLmFyZ3M6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHkoXCJTTE9XTE9HXCIsIHN1YmNvbW1hbmQsIC4uLmFyZ3MpO1xuICB9XG5cbiAgc21lbWJlcnMoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIlNNRU1CRVJTXCIsIGtleSk7XG4gIH1cblxuICBzbW92ZShzb3VyY2U6IHN0cmluZywgZGVzdGluYXRpb246IHN0cmluZywgbWVtYmVyOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiU01PVkVcIiwgc291cmNlLCBkZXN0aW5hdGlvbiwgbWVtYmVyKTtcbiAgfVxuXG4gIHNvcnQoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgb3B0cz86IFNvcnRPcHRzLFxuICApOiBQcm9taXNlPEJ1bGtTdHJpbmdbXT47XG4gIHNvcnQoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgb3B0cz86IFNvcnRXaXRoRGVzdGluYXRpb25PcHRzLFxuICApOiBQcm9taXNlPEludGVnZXI+O1xuICBzb3J0KFxuICAgIGtleTogc3RyaW5nLFxuICAgIG9wdHM/OiBTb3J0T3B0cyB8IFNvcnRXaXRoRGVzdGluYXRpb25PcHRzLFxuICApIHtcbiAgICBjb25zdCBhcmdzOiAobnVtYmVyIHwgc3RyaW5nKVtdID0gW2tleV07XG4gICAgaWYgKG9wdHM/LmJ5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGFyZ3MucHVzaChcIkJZXCIsIG9wdHMuYnkpO1xuICAgIH1cbiAgICBpZiAob3B0cz8ubGltaXQpIHtcbiAgICAgIGFyZ3MucHVzaChcIkxJTUlUXCIsIG9wdHMubGltaXQub2Zmc2V0LCBvcHRzLmxpbWl0LmNvdW50KTtcbiAgICB9XG4gICAgaWYgKG9wdHM/LnBhdHRlcm5zKSB7XG4gICAgICBhcmdzLnB1c2goXCJHRVRcIiwgLi4ub3B0cy5wYXR0ZXJucyk7XG4gICAgfVxuICAgIGlmIChvcHRzPy5vcmRlcikge1xuICAgICAgYXJncy5wdXNoKG9wdHMub3JkZXIpO1xuICAgIH1cbiAgICBpZiAob3B0cz8uYWxwaGEpIHtcbiAgICAgIGFyZ3MucHVzaChcIkFMUEhBXCIpO1xuICAgIH1cbiAgICBpZiAoKG9wdHMgYXMgU29ydFdpdGhEZXN0aW5hdGlvbk9wdHMpPy5kZXN0aW5hdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhcmdzLnB1c2goXCJTVE9SRVwiLCAob3B0cyBhcyBTb3J0V2l0aERlc3RpbmF0aW9uT3B0cykuZGVzdGluYXRpb24pO1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIlNPUlRcIiwgLi4uYXJncyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PEJ1bGtTdHJpbmc+KFwiU09SVFwiLCAuLi5hcmdzKTtcbiAgfVxuXG4gIHNwb3Aoa2V5OiBzdHJpbmcpOiBQcm9taXNlPEJ1bGs+O1xuICBzcG9wKGtleTogc3RyaW5nLCBjb3VudDogbnVtYmVyKTogUHJvbWlzZTxCdWxrU3RyaW5nW10+O1xuICBzcG9wKGtleTogc3RyaW5nLCBjb3VudD86IG51bWJlcikge1xuICAgIGlmIChjb3VudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIlNQT1BcIiwga2V5LCBjb3VudCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNCdWxrUmVwbHkoXCJTUE9QXCIsIGtleSk7XG4gIH1cblxuICBzcmFuZG1lbWJlcihrZXk6IHN0cmluZyk6IFByb21pc2U8QnVsaz47XG4gIHNyYW5kbWVtYmVyKGtleTogc3RyaW5nLCBjb3VudDogbnVtYmVyKTogUHJvbWlzZTxCdWxrU3RyaW5nW10+O1xuICBzcmFuZG1lbWJlcihrZXk6IHN0cmluZywgY291bnQ/OiBudW1iZXIpIHtcbiAgICBpZiAoY291bnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZz4oXCJTUkFORE1FTUJFUlwiLCBrZXksIGNvdW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseShcIlNSQU5ETUVNQkVSXCIsIGtleSk7XG4gIH1cblxuICBzcmVtKGtleTogc3RyaW5nLCAuLi5tZW1iZXJzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJTUkVNXCIsIGtleSwgLi4ubWVtYmVycyk7XG4gIH1cblxuICBzdHJhbGdvKFxuICAgIGFsZ29yaXRobTogU3RyYWxnb0FsZ29yaXRobSxcbiAgICB0YXJnZXQ6IFN0cmFsZ29UYXJnZXQsXG4gICAgYTogc3RyaW5nLFxuICAgIGI6IHN0cmluZyxcbiAgICBvcHRzPzogU3RyYWxnb09wdHMsXG4gICkge1xuICAgIGNvbnN0IGFyZ3M6IChudW1iZXIgfCBzdHJpbmcpW10gPSBbXTtcbiAgICBpZiAob3B0cz8uaWR4KSB7XG4gICAgICBhcmdzLnB1c2goXCJJRFhcIik7XG4gICAgfVxuICAgIGlmIChvcHRzPy5sZW4pIHtcbiAgICAgIGFyZ3MucHVzaChcIkxFTlwiKTtcbiAgICB9XG4gICAgaWYgKG9wdHM/LndpdGhtYXRjaGxlbikge1xuICAgICAgYXJncy5wdXNoKFwiV0lUSE1BVENITEVOXCIpO1xuICAgIH1cbiAgICBpZiAob3B0cz8ubWlubWF0Y2hsZW4pIHtcbiAgICAgIGFyZ3MucHVzaChcIk1JTk1BVENITEVOXCIpO1xuICAgICAgYXJncy5wdXNoKG9wdHMubWlubWF0Y2hsZW4pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjQnVsa1JlcGx5KFwiU1RSQUxHT1wiLCBhbGdvcml0aG0sIHRhcmdldCwgYSwgYiwgLi4uYXJncyk7XG4gIH1cblxuICBzdHJsZW4oa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiU1RSTEVOXCIsIGtleSk7XG4gIH1cblxuICBzdW5pb24oLi4ua2V5czogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIlNVTklPTlwiLCAuLi5rZXlzKTtcbiAgfVxuXG4gIHN1bmlvbnN0b3JlKGRlc3RpbmF0aW9uOiBzdHJpbmcsIC4uLmtleXM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIlNVTklPTlNUT1JFXCIsIGRlc3RpbmF0aW9uLCAuLi5rZXlzKTtcbiAgfVxuXG4gIHN3YXBkYihpbmRleDE6IG51bWJlciwgaW5kZXgyOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJTV0FQREJcIiwgaW5kZXgxLCBpbmRleDIpO1xuICB9XG5cbiAgc3luYygpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJub3QgaW1wbGVtZW50ZWRcIik7XG4gIH1cblxuICB0aW1lKCkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5KFwiVElNRVwiKSBhcyBQcm9taXNlPFtCdWxrU3RyaW5nLCBCdWxrU3RyaW5nXT47XG4gIH1cblxuICB0b3VjaCguLi5rZXlzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJUT1VDSFwiLCAuLi5rZXlzKTtcbiAgfVxuXG4gIHR0bChrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJUVExcIiwga2V5KTtcbiAgfVxuXG4gIHR5cGUoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJUWVBFXCIsIGtleSk7XG4gIH1cblxuICB1bmxpbmsoLi4ua2V5czogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiVU5MSU5LXCIsIC4uLmtleXMpO1xuICB9XG5cbiAgdW53YXRjaCgpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXCJVTldBVENIXCIpO1xuICB9XG5cbiAgd2FpdChudW1yZXBsaWNhczogbnVtYmVyLCB0aW1lb3V0OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiV0FJVFwiLCBudW1yZXBsaWNhcywgdGltZW91dCk7XG4gIH1cblxuICB3YXRjaCguLi5rZXlzOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNTdGF0dXNSZXBseShcIldBVENIXCIsIC4uLmtleXMpO1xuICB9XG5cbiAgeGFjayhrZXk6IHN0cmluZywgZ3JvdXA6IHN0cmluZywgLi4ueGlkczogWElkSW5wdXRbXSkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXG4gICAgICBcIlhBQ0tcIixcbiAgICAgIGtleSxcbiAgICAgIGdyb3VwLFxuICAgICAgLi4ueGlkcy5tYXAoKHhpZCkgPT4geGlkc3RyKHhpZCkpLFxuICAgICk7XG4gIH1cblxuICB4YWRkKFxuICAgIGtleTogc3RyaW5nLFxuICAgIHhpZDogWElkQWRkLFxuICAgIGZpZWxkVmFsdWVzOiBYQWRkRmllbGRWYWx1ZXMsXG4gICAgbWF4bGVuOiBYTWF4bGVuIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkLFxuICApIHtcbiAgICBjb25zdCBhcmdzOiBSZWRpc1ZhbHVlW10gPSBba2V5XTtcblxuICAgIGlmIChtYXhsZW4pIHtcbiAgICAgIGFyZ3MucHVzaChcIk1BWExFTlwiKTtcbiAgICAgIGlmIChtYXhsZW4uYXBwcm94KSB7XG4gICAgICAgIGFyZ3MucHVzaChcIn5cIik7XG4gICAgICB9XG4gICAgICBhcmdzLnB1c2gobWF4bGVuLmVsZW1lbnRzLnRvU3RyaW5nKCkpO1xuICAgIH1cblxuICAgIGFyZ3MucHVzaCh4aWRzdHIoeGlkKSk7XG5cbiAgICBpZiAoZmllbGRWYWx1ZXMgaW5zdGFuY2VvZiBNYXApIHtcbiAgICAgIGZvciAoY29uc3QgW2YsIHZdIG9mIGZpZWxkVmFsdWVzKSB7XG4gICAgICAgIGFyZ3MucHVzaChmKTtcbiAgICAgICAgYXJncy5wdXNoKHYpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGNvbnN0IFtmLCB2XSBvZiBPYmplY3QuZW50cmllcyhmaWVsZFZhbHVlcykpIHtcbiAgICAgICAgYXJncy5wdXNoKGYpO1xuICAgICAgICBhcmdzLnB1c2godik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseTxCdWxrU3RyaW5nPihcbiAgICAgIFwiWEFERFwiLFxuICAgICAgLi4uYXJncyxcbiAgICApLnRoZW4oKHJhd0lkKSA9PiBwYXJzZVhJZChyYXdJZCkpO1xuICB9XG5cbiAgeGNsYWltKGtleTogc3RyaW5nLCBvcHRzOiBYQ2xhaW1PcHRzLCAuLi54aWRzOiBYSWRJbnB1dFtdKSB7XG4gICAgY29uc3QgYXJncyA9IFtdO1xuICAgIGlmIChvcHRzLmlkbGUpIHtcbiAgICAgIGFyZ3MucHVzaChcIklETEVcIik7XG4gICAgICBhcmdzLnB1c2gob3B0cy5pZGxlKTtcbiAgICB9XG5cbiAgICBpZiAob3B0cy50aW1lKSB7XG4gICAgICBhcmdzLnB1c2goXCJUSU1FXCIpO1xuICAgICAgYXJncy5wdXNoKG9wdHMudGltZSk7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMucmV0cnlDb3VudCkge1xuICAgICAgYXJncy5wdXNoKFwiUkVUUllDT1VOVFwiKTtcbiAgICAgIGFyZ3MucHVzaChvcHRzLnJldHJ5Q291bnQpO1xuICAgIH1cblxuICAgIGlmIChvcHRzLmZvcmNlKSB7XG4gICAgICBhcmdzLnB1c2goXCJGT1JDRVwiKTtcbiAgICB9XG5cbiAgICBpZiAob3B0cy5qdXN0WElkKSB7XG4gICAgICBhcmdzLnB1c2goXCJKVVNUSURcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8WFJlYWRJZERhdGEgfCBCdWxrU3RyaW5nPihcbiAgICAgIFwiWENMQUlNXCIsXG4gICAgICBrZXksXG4gICAgICBvcHRzLmdyb3VwLFxuICAgICAgb3B0cy5jb25zdW1lcixcbiAgICAgIG9wdHMubWluSWRsZVRpbWUsXG4gICAgICAuLi54aWRzLm1hcCgoeGlkKSA9PiB4aWRzdHIoeGlkKSksXG4gICAgICAuLi5hcmdzLFxuICAgICkudGhlbigocmF3KSA9PiB7XG4gICAgICBpZiAob3B0cy5qdXN0WElkKSB7XG4gICAgICAgIGNvbnN0IHhpZHMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCByIG9mIHJhdykge1xuICAgICAgICAgIGlmICh0eXBlb2YgciA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgeGlkcy5wdXNoKHBhcnNlWElkKHIpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGF5bG9hZDogWENsYWltSnVzdFhJZCA9IHsga2luZDogXCJqdXN0eGlkXCIsIHhpZHMgfTtcbiAgICAgICAgcmV0dXJuIHBheWxvYWQ7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1lc3NhZ2VzID0gW107XG4gICAgICBmb3IgKGNvbnN0IHIgb2YgcmF3KSB7XG4gICAgICAgIGlmICh0eXBlb2YgciAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgIG1lc3NhZ2VzLnB1c2gocGFyc2VYTWVzc2FnZShyKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IHBheWxvYWQ6IFhDbGFpbU1lc3NhZ2VzID0geyBraW5kOiBcIm1lc3NhZ2VzXCIsIG1lc3NhZ2VzIH07XG4gICAgICByZXR1cm4gcGF5bG9hZDtcbiAgICB9KTtcbiAgfVxuXG4gIHhkZWwoa2V5OiBzdHJpbmcsIC4uLnhpZHM6IFhJZElucHV0W10pIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFxuICAgICAgXCJYREVMXCIsXG4gICAgICBrZXksXG4gICAgICAuLi54aWRzLm1hcCgocmF3SWQpID0+IHhpZHN0cihyYXdJZCkpLFxuICAgICk7XG4gIH1cblxuICB4bGVuKGtleTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIlhMRU5cIiwga2V5KTtcbiAgfVxuXG4gIHhncm91cENyZWF0ZShcbiAgICBrZXk6IHN0cmluZyxcbiAgICBncm91cE5hbWU6IHN0cmluZyxcbiAgICB4aWQ6IFhJZElucHV0IHwgXCIkXCIsXG4gICAgbWtzdHJlYW0/OiBib29sZWFuLFxuICApIHtcbiAgICBjb25zdCBhcmdzID0gW107XG4gICAgaWYgKG1rc3RyZWFtKSB7XG4gICAgICBhcmdzLnB1c2goXCJNS1NUUkVBTVwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5leGVjU3RhdHVzUmVwbHkoXG4gICAgICBcIlhHUk9VUFwiLFxuICAgICAgXCJDUkVBVEVcIixcbiAgICAgIGtleSxcbiAgICAgIGdyb3VwTmFtZSxcbiAgICAgIHhpZHN0cih4aWQpLFxuICAgICAgLi4uYXJncyxcbiAgICApO1xuICB9XG5cbiAgeGdyb3VwRGVsQ29uc3VtZXIoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgZ3JvdXBOYW1lOiBzdHJpbmcsXG4gICAgY29uc3VtZXJOYW1lOiBzdHJpbmcsXG4gICkge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXG4gICAgICBcIlhHUk9VUFwiLFxuICAgICAgXCJERUxDT05TVU1FUlwiLFxuICAgICAga2V5LFxuICAgICAgZ3JvdXBOYW1lLFxuICAgICAgY29uc3VtZXJOYW1lLFxuICAgICk7XG4gIH1cblxuICB4Z3JvdXBEZXN0cm95KGtleTogc3RyaW5nLCBncm91cE5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJYR1JPVVBcIiwgXCJERVNUUk9ZXCIsIGtleSwgZ3JvdXBOYW1lKTtcbiAgfVxuXG4gIHhncm91cEhlbHAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseTxCdWxrU3RyaW5nPihcIlhHUk9VUFwiLCBcIkhFTFBcIik7XG4gIH1cblxuICB4Z3JvdXBTZXRJRChcbiAgICBrZXk6IHN0cmluZyxcbiAgICBncm91cE5hbWU6IHN0cmluZyxcbiAgICB4aWQ6IFhJZCxcbiAgKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY1N0YXR1c1JlcGx5KFxuICAgICAgXCJYR1JPVVBcIixcbiAgICAgIFwiU0VUSURcIixcbiAgICAgIGtleSxcbiAgICAgIGdyb3VwTmFtZSxcbiAgICAgIHhpZHN0cih4aWQpLFxuICAgICk7XG4gIH1cblxuICB4aW5mb1N0cmVhbShrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PFJhdz4oXCJYSU5GT1wiLCBcIlNUUkVBTVwiLCBrZXkpLnRoZW4oXG4gICAgICAocmF3KSA9PiB7XG4gICAgICAgIC8vIE5vdGUgdGhhdCB5b3Ugc2hvdWxkIG5vdCByZWx5IG9uIHRoZSBmaWVsZHNcbiAgICAgICAgLy8gZXhhY3QgcG9zaXRpb24sIG5vciBvbiB0aGUgbnVtYmVyIG9mIGZpZWxkcyxcbiAgICAgICAgLy8gbmV3IGZpZWxkcyBtYXkgYmUgYWRkZWQgaW4gdGhlIGZ1dHVyZS5cbiAgICAgICAgY29uc3QgZGF0YTogTWFwPHN0cmluZywgUmF3PiA9IGNvbnZlcnRNYXAocmF3KTtcblxuICAgICAgICBjb25zdCBmaXJzdEVudHJ5ID0gcGFyc2VYTWVzc2FnZShcbiAgICAgICAgICBkYXRhLmdldChcImZpcnN0LWVudHJ5XCIpIGFzIFhSZWFkSWREYXRhLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBsYXN0RW50cnkgPSBwYXJzZVhNZXNzYWdlKFxuICAgICAgICAgIGRhdGEuZ2V0KFwibGFzdC1lbnRyeVwiKSBhcyBYUmVhZElkRGF0YSxcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxlbmd0aDogcmF3bnVtKGRhdGEuZ2V0KFwibGVuZ3RoXCIpKSxcbiAgICAgICAgICByYWRpeFRyZWVLZXlzOiByYXdudW0oZGF0YS5nZXQoXCJyYWRpeC10cmVlLWtleXNcIikpLFxuICAgICAgICAgIHJhZGl4VHJlZU5vZGVzOiByYXdudW0oZGF0YS5nZXQoXCJyYWRpeC10cmVlLW5vZGVzXCIpKSxcbiAgICAgICAgICBncm91cHM6IHJhd251bShkYXRhLmdldChcImdyb3Vwc1wiKSksXG4gICAgICAgICAgbGFzdEdlbmVyYXRlZElkOiBwYXJzZVhJZChyYXdzdHIoZGF0YS5nZXQoXCJsYXN0LWdlbmVyYXRlZC1pZFwiKSkpLFxuICAgICAgICAgIGZpcnN0RW50cnksXG4gICAgICAgICAgbGFzdEVudHJ5LFxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICApO1xuICB9XG5cbiAgeGluZm9TdHJlYW1GdWxsKGtleTogc3RyaW5nLCBjb3VudD86IG51bWJlcikge1xuICAgIGNvbnN0IGFyZ3MgPSBbXTtcbiAgICBpZiAoY291bnQpIHtcbiAgICAgIGFyZ3MucHVzaChcIkNPVU5UXCIpO1xuICAgICAgYXJncy5wdXNoKGNvdW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8UmF3PihcIlhJTkZPXCIsIFwiU1RSRUFNXCIsIGtleSwgXCJGVUxMXCIsIC4uLmFyZ3MpXG4gICAgICAudGhlbihcbiAgICAgICAgKHJhdykgPT4ge1xuICAgICAgICAgIC8vIE5vdGUgdGhhdCB5b3Ugc2hvdWxkIG5vdCByZWx5IG9uIHRoZSBmaWVsZHNcbiAgICAgICAgICAvLyBleGFjdCBwb3NpdGlvbiwgbm9yIG9uIHRoZSBudW1iZXIgb2YgZmllbGRzLFxuICAgICAgICAgIC8vIG5ldyBmaWVsZHMgbWF5IGJlIGFkZGVkIGluIHRoZSBmdXR1cmUuXG4gICAgICAgICAgaWYgKHJhdyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBcIm5vIGRhdGFcIjtcblxuICAgICAgICAgIGNvbnN0IGRhdGE6IE1hcDxzdHJpbmcsIFJhdz4gPSBjb252ZXJ0TWFwKHJhdyk7XG4gICAgICAgICAgaWYgKGRhdGEgPT09IHVuZGVmaW5lZCkgdGhyb3cgXCJubyBkYXRhIGNvbnZlcnRlZFwiO1xuXG4gICAgICAgICAgY29uc3QgZW50cmllcyA9IChkYXRhLmdldChcImVudHJpZXNcIikgYXMgQ29uZGl0aW9uYWxBcnJheSkubWFwKChcbiAgICAgICAgICAgIHJhdzogUmF3LFxuICAgICAgICAgICkgPT4gcGFyc2VYTWVzc2FnZShyYXcgYXMgWFJlYWRJZERhdGEpKTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVuZ3RoOiByYXdudW0oZGF0YS5nZXQoXCJsZW5ndGhcIikpLFxuICAgICAgICAgICAgcmFkaXhUcmVlS2V5czogcmF3bnVtKGRhdGEuZ2V0KFwicmFkaXgtdHJlZS1rZXlzXCIpKSxcbiAgICAgICAgICAgIHJhZGl4VHJlZU5vZGVzOiByYXdudW0oZGF0YS5nZXQoXCJyYWRpeC10cmVlLW5vZGVzXCIpKSxcbiAgICAgICAgICAgIGxhc3RHZW5lcmF0ZWRJZDogcGFyc2VYSWQocmF3c3RyKGRhdGEuZ2V0KFwibGFzdC1nZW5lcmF0ZWQtaWRcIikpKSxcbiAgICAgICAgICAgIGVudHJpZXMsXG4gICAgICAgICAgICBncm91cHM6IHBhcnNlWEdyb3VwRGV0YWlsKGRhdGEuZ2V0KFwiZ3JvdXBzXCIpIGFzIENvbmRpdGlvbmFsQXJyYXkpLFxuICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICApO1xuICB9XG5cbiAgeGluZm9Hcm91cHMoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxDb25kaXRpb25hbEFycmF5PihcIlhJTkZPXCIsIFwiR1JPVVBTXCIsIGtleSkudGhlbihcbiAgICAgIChyYXdzKSA9PlxuICAgICAgICByYXdzLm1hcCgocmF3KSA9PiB7XG4gICAgICAgICAgY29uc3QgZGF0YSA9IGNvbnZlcnRNYXAocmF3KTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogcmF3c3RyKGRhdGEuZ2V0KFwibmFtZVwiKSksXG4gICAgICAgICAgICBjb25zdW1lcnM6IHJhd251bShkYXRhLmdldChcImNvbnN1bWVyc1wiKSksXG4gICAgICAgICAgICBwZW5kaW5nOiByYXdudW0oZGF0YS5nZXQoXCJwZW5kaW5nXCIpKSxcbiAgICAgICAgICAgIGxhc3REZWxpdmVyZWRJZDogcGFyc2VYSWQocmF3c3RyKGRhdGEuZ2V0KFwibGFzdC1kZWxpdmVyZWQtaWRcIikpKSxcbiAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgeGluZm9Db25zdW1lcnMoa2V5OiBzdHJpbmcsIGdyb3VwOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxDb25kaXRpb25hbEFycmF5PihcbiAgICAgIFwiWElORk9cIixcbiAgICAgIFwiQ09OU1VNRVJTXCIsXG4gICAgICBrZXksXG4gICAgICBncm91cCxcbiAgICApLnRoZW4oXG4gICAgICAocmF3cykgPT5cbiAgICAgICAgcmF3cy5tYXAoKHJhdykgPT4ge1xuICAgICAgICAgIGNvbnN0IGRhdGEgPSBjb252ZXJ0TWFwKHJhdyk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5hbWU6IHJhd3N0cihkYXRhLmdldChcIm5hbWVcIikpLFxuICAgICAgICAgICAgcGVuZGluZzogcmF3bnVtKGRhdGEuZ2V0KFwicGVuZGluZ1wiKSksXG4gICAgICAgICAgICBpZGxlOiByYXdudW0oZGF0YS5nZXQoXCJpZGxlXCIpKSxcbiAgICAgICAgICB9O1xuICAgICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgeHBlbmRpbmcoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgZ3JvdXA6IHN0cmluZyxcbiAgKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8UmF3PihcIlhQRU5ESU5HXCIsIGtleSwgZ3JvdXApXG4gICAgICAudGhlbigocmF3KSA9PiB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBpc051bWJlcihyYXdbMF0pICYmIGlzU3RyaW5nKHJhd1sxXSkgJiZcbiAgICAgICAgICBpc1N0cmluZyhyYXdbMl0pICYmIGlzQ29uZEFycmF5KHJhd1szXSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvdW50OiByYXdbMF0sXG4gICAgICAgICAgICBzdGFydElkOiBwYXJzZVhJZChyYXdbMV0pLFxuICAgICAgICAgICAgZW5kSWQ6IHBhcnNlWElkKHJhd1syXSksXG4gICAgICAgICAgICBjb25zdW1lcnM6IHBhcnNlWFBlbmRpbmdDb25zdW1lcnMocmF3WzNdKSxcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IFwicGFyc2UgZXJyXCI7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgeHBlbmRpbmdDb3VudChcbiAgICBrZXk6IHN0cmluZyxcbiAgICBncm91cDogc3RyaW5nLFxuICAgIHN0YXJ0RW5kQ291bnQ6IFN0YXJ0RW5kQ291bnQsXG4gICAgY29uc3VtZXI/OiBzdHJpbmcsXG4gICkge1xuICAgIGNvbnN0IGFyZ3MgPSBbXTtcbiAgICBhcmdzLnB1c2goc3RhcnRFbmRDb3VudC5zdGFydCk7XG4gICAgYXJncy5wdXNoKHN0YXJ0RW5kQ291bnQuZW5kKTtcbiAgICBhcmdzLnB1c2goc3RhcnRFbmRDb3VudC5jb3VudCk7XG5cbiAgICBpZiAoY29uc3VtZXIpIHtcbiAgICAgIGFyZ3MucHVzaChjb25zdW1lcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8UmF3PihcIlhQRU5ESU5HXCIsIGtleSwgZ3JvdXAsIC4uLmFyZ3MpXG4gICAgICAudGhlbigocmF3KSA9PiBwYXJzZVhQZW5kaW5nQ291bnRzKHJhdykpO1xuICB9XG5cbiAgeHJhbmdlKFxuICAgIGtleTogc3RyaW5nLFxuICAgIHN0YXJ0OiBYSWROZWcsXG4gICAgZW5kOiBYSWRQb3MsXG4gICAgY291bnQ/OiBudW1iZXIsXG4gICkge1xuICAgIGNvbnN0IGFyZ3M6IChzdHJpbmcgfCBudW1iZXIpW10gPSBba2V5LCB4aWRzdHIoc3RhcnQpLCB4aWRzdHIoZW5kKV07XG4gICAgaWYgKGNvdW50KSB7XG4gICAgICBhcmdzLnB1c2goXCJDT1VOVFwiKTtcbiAgICAgIGFyZ3MucHVzaChjb3VudCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PFhSZWFkSWREYXRhPihcIlhSQU5HRVwiLCAuLi5hcmdzKS50aGVuKFxuICAgICAgKHJhdykgPT4gcmF3Lm1hcCgobSkgPT4gcGFyc2VYTWVzc2FnZShtKSksXG4gICAgKTtcbiAgfVxuXG4gIHhyZXZyYW5nZShcbiAgICBrZXk6IHN0cmluZyxcbiAgICBzdGFydDogWElkUG9zLFxuICAgIGVuZDogWElkTmVnLFxuICAgIGNvdW50PzogbnVtYmVyLFxuICApIHtcbiAgICBjb25zdCBhcmdzOiAoc3RyaW5nIHwgbnVtYmVyKVtdID0gW2tleSwgeGlkc3RyKHN0YXJ0KSwgeGlkc3RyKGVuZCldO1xuICAgIGlmIChjb3VudCkge1xuICAgICAgYXJncy5wdXNoKFwiQ09VTlRcIik7XG4gICAgICBhcmdzLnB1c2goY291bnQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxYUmVhZElkRGF0YT4oXCJYUkVWUkFOR0VcIiwgLi4uYXJncykudGhlbihcbiAgICAgIChyYXcpID0+IHJhdy5tYXAoKG0pID0+IHBhcnNlWE1lc3NhZ2UobSkpLFxuICAgICk7XG4gIH1cblxuICB4cmVhZChcbiAgICBrZXlYSWRzOiAoWEtleUlkIHwgWEtleUlkTGlrZSlbXSxcbiAgICBvcHRzPzogWFJlYWRPcHRzLFxuICApIHtcbiAgICBjb25zdCBhcmdzID0gW107XG4gICAgaWYgKG9wdHMpIHtcbiAgICAgIGlmIChvcHRzLmNvdW50KSB7XG4gICAgICAgIGFyZ3MucHVzaChcIkNPVU5UXCIpO1xuICAgICAgICBhcmdzLnB1c2gob3B0cy5jb3VudCk7XG4gICAgICB9XG4gICAgICBpZiAob3B0cy5ibG9jaykge1xuICAgICAgICBhcmdzLnB1c2goXCJCTE9DS1wiKTtcbiAgICAgICAgYXJncy5wdXNoKG9wdHMuYmxvY2spO1xuICAgICAgfVxuICAgIH1cbiAgICBhcmdzLnB1c2goXCJTVFJFQU1TXCIpO1xuXG4gICAgY29uc3QgdGhlS2V5cyA9IFtdO1xuICAgIGNvbnN0IHRoZVhJZHMgPSBbXTtcblxuICAgIGZvciAoY29uc3QgYSBvZiBrZXlYSWRzKSB7XG4gICAgICBpZiAoYSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIC8vIFhLZXlJZExpa2VcbiAgICAgICAgdGhlS2V5cy5wdXNoKGFbMF0pO1xuICAgICAgICB0aGVYSWRzLnB1c2goeGlkc3RyKGFbMV0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFhLZXlJZFxuICAgICAgICB0aGVLZXlzLnB1c2goYS5rZXkpO1xuICAgICAgICB0aGVYSWRzLnB1c2goeGlkc3RyKGEueGlkKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8WFJlYWRTdHJlYW1SYXc+KFxuICAgICAgXCJYUkVBRFwiLFxuICAgICAgLi4uYXJncy5jb25jYXQodGhlS2V5cykuY29uY2F0KHRoZVhJZHMpLFxuICAgICkudGhlbigocmF3KSA9PiBwYXJzZVhSZWFkUmVwbHkocmF3KSk7XG4gIH1cblxuICB4cmVhZGdyb3VwKFxuICAgIGtleVhJZHM6IChYS2V5SWRHcm91cCB8IFhLZXlJZEdyb3VwTGlrZSlbXSxcbiAgICB7IGdyb3VwLCBjb25zdW1lciwgY291bnQsIGJsb2NrIH06IFhSZWFkR3JvdXBPcHRzLFxuICApIHtcbiAgICBjb25zdCBhcmdzOiAoc3RyaW5nIHwgbnVtYmVyKVtdID0gW1xuICAgICAgXCJHUk9VUFwiLFxuICAgICAgZ3JvdXAsXG4gICAgICBjb25zdW1lcixcbiAgICBdO1xuXG4gICAgaWYgKGNvdW50KSB7XG4gICAgICBhcmdzLnB1c2goXCJDT1VOVFwiKTtcbiAgICAgIGFyZ3MucHVzaChjb3VudCk7XG4gICAgfVxuICAgIGlmIChibG9jaykge1xuICAgICAgYXJncy5wdXNoKFwiQkxPQ0tcIik7XG4gICAgICBhcmdzLnB1c2goYmxvY2spO1xuICAgIH1cblxuICAgIGFyZ3MucHVzaChcIlNUUkVBTVNcIik7XG5cbiAgICBjb25zdCB0aGVLZXlzID0gW107XG4gICAgY29uc3QgdGhlWElkcyA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBhIG9mIGtleVhJZHMpIHtcbiAgICAgIGlmIChhIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgLy8gWEtleUlkR3JvdXBMaWtlXG4gICAgICAgIHRoZUtleXMucHVzaChhWzBdKTtcbiAgICAgICAgdGhlWElkcy5wdXNoKGFbMV0gPT09IFwiPlwiID8gXCI+XCIgOiB4aWRzdHIoYVsxXSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gWEtleUlkR3JvdXBcbiAgICAgICAgdGhlS2V5cy5wdXNoKGEua2V5KTtcbiAgICAgICAgdGhlWElkcy5wdXNoKGEueGlkID09PSBcIj5cIiA/IFwiPlwiIDogeGlkc3RyKGEueGlkKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8WFJlYWRTdHJlYW1SYXc+KFxuICAgICAgXCJYUkVBREdST1VQXCIsXG4gICAgICAuLi5hcmdzLmNvbmNhdCh0aGVLZXlzKS5jb25jYXQodGhlWElkcyksXG4gICAgKS50aGVuKChyYXcpID0+IHBhcnNlWFJlYWRSZXBseShyYXcpKTtcbiAgfVxuXG4gIHh0cmltKGtleTogc3RyaW5nLCBtYXhsZW46IFhNYXhsZW4pIHtcbiAgICBjb25zdCBhcmdzID0gW107XG4gICAgaWYgKG1heGxlbi5hcHByb3gpIHtcbiAgICAgIGFyZ3MucHVzaChcIn5cIik7XG4gICAgfVxuXG4gICAgYXJncy5wdXNoKG1heGxlbi5lbGVtZW50cyk7XG5cbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiWFRSSU1cIiwga2V5LCBcIk1BWExFTlwiLCAuLi5hcmdzKTtcbiAgfVxuXG4gIHphZGQoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgc2NvcmU6IG51bWJlcixcbiAgICBtZW1iZXI6IHN0cmluZyxcbiAgICBvcHRzPzogWkFkZE9wdHMsXG4gICk6IFByb21pc2U8SW50ZWdlcj47XG4gIHphZGQoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgc2NvcmVNZW1iZXJzOiBbbnVtYmVyLCBzdHJpbmddW10sXG4gICAgb3B0cz86IFpBZGRPcHRzLFxuICApOiBQcm9taXNlPEludGVnZXI+O1xuICB6YWRkKFxuICAgIGtleTogc3RyaW5nLFxuICAgIG1lbWJlclNjb3JlczogUmVjb3JkPHN0cmluZywgbnVtYmVyPixcbiAgICBvcHRzPzogWkFkZE9wdHMsXG4gICk6IFByb21pc2U8SW50ZWdlcj47XG4gIHphZGQoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgcGFyYW0xOiBudW1iZXIgfCBbbnVtYmVyLCBzdHJpbmddW10gfCBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+LFxuICAgIHBhcmFtMj86IHN0cmluZyB8IFpBZGRPcHRzLFxuICAgIG9wdHM/OiBaQWRkT3B0cyxcbiAgKSB7XG4gICAgY29uc3QgYXJnczogKHN0cmluZyB8IG51bWJlcilbXSA9IFtrZXldO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHBhcmFtMSkpIHtcbiAgICAgIHRoaXMucHVzaFpBZGRPcHRzKGFyZ3MsIHBhcmFtMiBhcyBaQWRkT3B0cyk7XG4gICAgICBhcmdzLnB1c2goLi4ucGFyYW0xLmZsYXRNYXAoKGUpID0+IGUpKTtcbiAgICAgIG9wdHMgPSBwYXJhbTIgYXMgWkFkZE9wdHM7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcGFyYW0xID09PSBcIm9iamVjdFwiKSB7XG4gICAgICB0aGlzLnB1c2haQWRkT3B0cyhhcmdzLCBwYXJhbTIgYXMgWkFkZE9wdHMpO1xuICAgICAgZm9yIChjb25zdCBbbWVtYmVyLCBzY29yZV0gb2YgT2JqZWN0LmVudHJpZXMocGFyYW0xKSkge1xuICAgICAgICBhcmdzLnB1c2goc2NvcmUgYXMgbnVtYmVyLCBtZW1iZXIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnB1c2haQWRkT3B0cyhhcmdzLCBvcHRzKTtcbiAgICAgIGFyZ3MucHVzaChwYXJhbTEsIHBhcmFtMiBhcyBzdHJpbmcpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiWkFERFwiLCAuLi5hcmdzKTtcbiAgfVxuXG4gIHByaXZhdGUgcHVzaFpBZGRPcHRzKFxuICAgIGFyZ3M6IChzdHJpbmcgfCBudW1iZXIpW10sXG4gICAgb3B0cz86IFpBZGRPcHRzLFxuICApOiB2b2lkIHtcbiAgICBpZiAob3B0cz8ubW9kZSkge1xuICAgICAgYXJncy5wdXNoKG9wdHMubW9kZSk7XG4gICAgfVxuICAgIGlmIChvcHRzPy5jaCkge1xuICAgICAgYXJncy5wdXNoKFwiQ0hcIik7XG4gICAgfVxuICB9XG5cbiAgemFkZEluY3IoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgc2NvcmU6IG51bWJlcixcbiAgICBtZW1iZXI6IHN0cmluZyxcbiAgICBvcHRzPzogWkFkZE9wdHMsXG4gICkge1xuICAgIGNvbnN0IGFyZ3M6IChzdHJpbmcgfCBudW1iZXIpW10gPSBba2V5LCBzY29yZSwgbWVtYmVyXTtcbiAgICBpZiAob3B0cz8ubW9kZSkge1xuICAgICAgYXJncy5wdXNoKG9wdHMubW9kZSk7XG4gICAgfVxuICAgIGlmIChvcHRzPy5jaCkge1xuICAgICAgYXJncy5wdXNoKFwiQ0hcIik7XG4gICAgfVxuICAgIGFyZ3MucHVzaChcIklOQ1JcIik7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseShcIlpBRERcIiwgLi4uYXJncyk7XG4gIH1cblxuICB6Y2FyZChrZXk6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJaQ0FSRFwiLCBrZXkpO1xuICB9XG5cbiAgemNvdW50KGtleTogc3RyaW5nLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiWkNPVU5UXCIsIGtleSwgbWluLCBtYXgpO1xuICB9XG5cbiAgemluY3JieShrZXk6IHN0cmluZywgaW5jcmVtZW50OiBudW1iZXIsIG1lbWJlcjogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0J1bGtSZXBseTxCdWxrU3RyaW5nPihcIlpJTkNSQllcIiwga2V5LCBpbmNyZW1lbnQsIG1lbWJlcik7XG4gIH1cblxuICB6aW50ZXJzdG9yZShcbiAgICBkZXN0aW5hdGlvbjogc3RyaW5nLFxuICAgIGtleXM6IHN0cmluZ1tdIHwgW3N0cmluZywgbnVtYmVyXVtdIHwgUmVjb3JkPHN0cmluZywgbnVtYmVyPixcbiAgICBvcHRzPzogWkludGVyc3RvcmVPcHRzLFxuICApIHtcbiAgICBjb25zdCBhcmdzID0gdGhpcy5wdXNoWlN0b3JlQXJncyhbZGVzdGluYXRpb25dLCBrZXlzLCBvcHRzKTtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiWklOVEVSU1RPUkVcIiwgLi4uYXJncyk7XG4gIH1cblxuICB6dW5pb25zdG9yZShcbiAgICBkZXN0aW5hdGlvbjogc3RyaW5nLFxuICAgIGtleXM6IHN0cmluZ1tdIHwgW3N0cmluZywgbnVtYmVyXVtdIHwgUmVjb3JkPHN0cmluZywgbnVtYmVyPixcbiAgICBvcHRzPzogWlVuaW9uc3RvcmVPcHRzLFxuICApIHtcbiAgICBjb25zdCBhcmdzID0gdGhpcy5wdXNoWlN0b3JlQXJncyhbZGVzdGluYXRpb25dLCBrZXlzLCBvcHRzKTtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiWlVOSU9OU1RPUkVcIiwgLi4uYXJncyk7XG4gIH1cblxuICBwcml2YXRlIHB1c2haU3RvcmVBcmdzKFxuICAgIGFyZ3M6IChudW1iZXIgfCBzdHJpbmcpW10sXG4gICAga2V5czogc3RyaW5nW10gfCBbc3RyaW5nLCBudW1iZXJdW10gfCBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+LFxuICAgIG9wdHM/OiBaSW50ZXJzdG9yZU9wdHMgfCBaVW5pb25zdG9yZU9wdHMsXG4gICkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGtleXMpKSB7XG4gICAgICBhcmdzLnB1c2goa2V5cy5sZW5ndGgpO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoa2V5c1swXSkpIHtcbiAgICAgICAga2V5cyA9IGtleXMgYXMgW3N0cmluZywgbnVtYmVyXVtdO1xuICAgICAgICBhcmdzLnB1c2goLi4ua2V5cy5tYXAoKGUpID0+IGVbMF0pKTtcbiAgICAgICAgYXJncy5wdXNoKFwiV0VJR0hUU1wiKTtcbiAgICAgICAgYXJncy5wdXNoKC4uLmtleXMubWFwKChlKSA9PiBlWzFdKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhcmdzLnB1c2goLi4uKGtleXMgYXMgc3RyaW5nW10pKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYXJncy5wdXNoKE9iamVjdC5rZXlzKGtleXMpLmxlbmd0aCk7XG4gICAgICBhcmdzLnB1c2goLi4uT2JqZWN0LmtleXMoa2V5cykpO1xuICAgICAgYXJncy5wdXNoKFwiV0VJR0hUU1wiKTtcbiAgICAgIGFyZ3MucHVzaCguLi5PYmplY3QudmFsdWVzKGtleXMpKTtcbiAgICB9XG4gICAgaWYgKG9wdHM/LmFnZ3JlZ2F0ZSkge1xuICAgICAgYXJncy5wdXNoKFwiQUdHUkVHQVRFXCIsIG9wdHMuYWdncmVnYXRlKTtcbiAgICB9XG4gICAgcmV0dXJuIGFyZ3M7XG4gIH1cblxuICB6bGV4Y291bnQoa2V5OiBzdHJpbmcsIG1pbjogc3RyaW5nLCBtYXg6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJaTEVYQ09VTlRcIiwga2V5LCBtaW4sIG1heCk7XG4gIH1cblxuICB6cG9wbWF4KGtleTogc3RyaW5nLCBjb3VudD86IG51bWJlcikge1xuICAgIGlmIChjb3VudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIlpQT1BNQVhcIiwga2V5LCBjb3VudCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PEJ1bGtTdHJpbmc+KFwiWlBPUE1BWFwiLCBrZXkpO1xuICB9XG5cbiAgenBvcG1pbihrZXk6IHN0cmluZywgY291bnQ/OiBudW1iZXIpIHtcbiAgICBpZiAoY291bnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZz4oXCJaUE9QTUlOXCIsIGtleSwgY291bnQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIlpQT1BNSU5cIiwga2V5KTtcbiAgfVxuXG4gIHpyYW5nZShcbiAgICBrZXk6IHN0cmluZyxcbiAgICBzdGFydDogbnVtYmVyLFxuICAgIHN0b3A6IG51bWJlcixcbiAgICBvcHRzPzogWlJhbmdlT3B0cyxcbiAgKSB7XG4gICAgY29uc3QgYXJncyA9IHRoaXMucHVzaFpSYW5nZU9wdHMoW2tleSwgc3RhcnQsIHN0b3BdLCBvcHRzKTtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIlpSQU5HRVwiLCAuLi5hcmdzKTtcbiAgfVxuXG4gIHpyYW5nZWJ5bGV4KFxuICAgIGtleTogc3RyaW5nLFxuICAgIG1pbjogc3RyaW5nLFxuICAgIG1heDogc3RyaW5nLFxuICAgIG9wdHM/OiBaUmFuZ2VCeUxleE9wdHMsXG4gICkge1xuICAgIGNvbnN0IGFyZ3MgPSB0aGlzLnB1c2haUmFuZ2VPcHRzKFtrZXksIG1pbiwgbWF4XSwgb3B0cyk7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZz4oXCJaUkFOR0VCWUxFWFwiLCAuLi5hcmdzKTtcbiAgfVxuXG4gIHpyYW5nZWJ5c2NvcmUoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgbWluOiBudW1iZXIgfCBzdHJpbmcsXG4gICAgbWF4OiBudW1iZXIgfCBzdHJpbmcsXG4gICAgb3B0cz86IFpSYW5nZUJ5U2NvcmVPcHRzLFxuICApIHtcbiAgICBjb25zdCBhcmdzID0gdGhpcy5wdXNoWlJhbmdlT3B0cyhba2V5LCBtaW4sIG1heF0sIG9wdHMpO1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PEJ1bGtTdHJpbmc+KFwiWlJBTkdFQllTQ09SRVwiLCAuLi5hcmdzKTtcbiAgfVxuXG4gIHpyYW5rKGtleTogc3RyaW5nLCBtZW1iZXI6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyT3JOaWxSZXBseShcIlpSQU5LXCIsIGtleSwgbWVtYmVyKTtcbiAgfVxuXG4gIHpyZW0oa2V5OiBzdHJpbmcsIC4uLm1lbWJlcnM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0ludGVnZXJSZXBseShcIlpSRU1cIiwga2V5LCAuLi5tZW1iZXJzKTtcbiAgfVxuXG4gIHpyZW1yYW5nZWJ5bGV4KGtleTogc3RyaW5nLCBtaW46IHN0cmluZywgbWF4OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiWlJFTVJBTkdFQllMRVhcIiwga2V5LCBtaW4sIG1heCk7XG4gIH1cblxuICB6cmVtcmFuZ2VieXJhbmsoa2V5OiBzdHJpbmcsIHN0YXJ0OiBudW1iZXIsIHN0b3A6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyUmVwbHkoXCJaUkVNUkFOR0VCWVJBTktcIiwga2V5LCBzdGFydCwgc3RvcCk7XG4gIH1cblxuICB6cmVtcmFuZ2VieXNjb3JlKGtleTogc3RyaW5nLCBtaW46IG51bWJlciB8IHN0cmluZywgbWF4OiBudW1iZXIgfCBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjSW50ZWdlclJlcGx5KFwiWlJFTVJBTkdFQllTQ09SRVwiLCBrZXksIG1pbiwgbWF4KTtcbiAgfVxuXG4gIHpyZXZyYW5nZShcbiAgICBrZXk6IHN0cmluZyxcbiAgICBzdGFydDogbnVtYmVyLFxuICAgIHN0b3A6IG51bWJlcixcbiAgICBvcHRzPzogWlJhbmdlT3B0cyxcbiAgKSB7XG4gICAgY29uc3QgYXJncyA9IHRoaXMucHVzaFpSYW5nZU9wdHMoW2tleSwgc3RhcnQsIHN0b3BdLCBvcHRzKTtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseTxCdWxrU3RyaW5nPihcIlpSRVZSQU5HRVwiLCAuLi5hcmdzKTtcbiAgfVxuXG4gIHpyZXZyYW5nZWJ5bGV4KFxuICAgIGtleTogc3RyaW5nLFxuICAgIG1heDogc3RyaW5nLFxuICAgIG1pbjogc3RyaW5nLFxuICAgIG9wdHM/OiBaUmFuZ2VCeUxleE9wdHMsXG4gICkge1xuICAgIGNvbnN0IGFyZ3MgPSB0aGlzLnB1c2haUmFuZ2VPcHRzKFtrZXksIG1pbiwgbWF4XSwgb3B0cyk7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHk8QnVsa1N0cmluZz4oXCJaUkVWUkFOR0VCWUxFWFwiLCAuLi5hcmdzKTtcbiAgfVxuXG4gIHpyZXZyYW5nZWJ5c2NvcmUoXG4gICAga2V5OiBzdHJpbmcsXG4gICAgbWF4OiBudW1iZXIsXG4gICAgbWluOiBudW1iZXIsXG4gICAgb3B0cz86IFpSYW5nZUJ5U2NvcmVPcHRzLFxuICApIHtcbiAgICBjb25zdCBhcmdzID0gdGhpcy5wdXNoWlJhbmdlT3B0cyhba2V5LCBtYXgsIG1pbl0sIG9wdHMpO1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5PEJ1bGtTdHJpbmc+KFwiWlJFVlJBTkdFQllTQ09SRVwiLCAuLi5hcmdzKTtcbiAgfVxuXG4gIHByaXZhdGUgcHVzaFpSYW5nZU9wdHMoXG4gICAgYXJnczogKG51bWJlciB8IHN0cmluZylbXSxcbiAgICBvcHRzPzogWlJhbmdlT3B0cyB8IFpSYW5nZUJ5TGV4T3B0cyB8IFpSYW5nZUJ5U2NvcmVPcHRzLFxuICApIHtcbiAgICBpZiAoKG9wdHMgYXMgWlJhbmdlQnlTY29yZU9wdHMpPy53aXRoU2NvcmUpIHtcbiAgICAgIGFyZ3MucHVzaChcIldJVEhTQ09SRVNcIik7XG4gICAgfVxuICAgIGlmICgob3B0cyBhcyBaUmFuZ2VCeVNjb3JlT3B0cyk/LmxpbWl0KSB7XG4gICAgICBhcmdzLnB1c2goXG4gICAgICAgIFwiTElNSVRcIixcbiAgICAgICAgKG9wdHMgYXMgWlJhbmdlQnlTY29yZU9wdHMpLmxpbWl0IS5vZmZzZXQsXG4gICAgICAgIChvcHRzIGFzIFpSYW5nZUJ5U2NvcmVPcHRzKS5saW1pdCEuY291bnQsXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gYXJncztcbiAgfVxuXG4gIHpyZXZyYW5rKGtleTogc3RyaW5nLCBtZW1iZXI6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmV4ZWNJbnRlZ2VyT3JOaWxSZXBseShcIlpSRVZSQU5LXCIsIGtleSwgbWVtYmVyKTtcbiAgfVxuXG4gIHpzY29yZShrZXk6IHN0cmluZywgbWVtYmVyOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5leGVjQnVsa1JlcGx5KFwiWlNDT1JFXCIsIGtleSwgbWVtYmVyKTtcbiAgfVxuXG4gIHNjYW4oXG4gICAgY3Vyc29yOiBudW1iZXIsXG4gICAgb3B0cz86IFNjYW5PcHRzLFxuICApIHtcbiAgICBjb25zdCBhcmdzID0gdGhpcy5wdXNoU2Nhbk9wdHMoW2N1cnNvcl0sIG9wdHMpO1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5KFwiU0NBTlwiLCAuLi5hcmdzKSBhcyBQcm9taXNlPFxuICAgICAgW0J1bGtTdHJpbmcsIEJ1bGtTdHJpbmdbXV1cbiAgICA+O1xuICB9XG5cbiAgc3NjYW4oXG4gICAga2V5OiBzdHJpbmcsXG4gICAgY3Vyc29yOiBudW1iZXIsXG4gICAgb3B0cz86IFNTY2FuT3B0cyxcbiAgKSB7XG4gICAgY29uc3QgYXJncyA9IHRoaXMucHVzaFNjYW5PcHRzKFtrZXksIGN1cnNvcl0sIG9wdHMpO1xuICAgIHJldHVybiB0aGlzLmV4ZWNBcnJheVJlcGx5KFwiU1NDQU5cIiwgLi4uYXJncykgYXMgUHJvbWlzZTxcbiAgICAgIFtCdWxrU3RyaW5nLCBCdWxrU3RyaW5nW11dXG4gICAgPjtcbiAgfVxuXG4gIGhzY2FuKFxuICAgIGtleTogc3RyaW5nLFxuICAgIGN1cnNvcjogbnVtYmVyLFxuICAgIG9wdHM/OiBIU2Nhbk9wdHMsXG4gICkge1xuICAgIGNvbnN0IGFyZ3MgPSB0aGlzLnB1c2hTY2FuT3B0cyhba2V5LCBjdXJzb3JdLCBvcHRzKTtcbiAgICByZXR1cm4gdGhpcy5leGVjQXJyYXlSZXBseShcIkhTQ0FOXCIsIC4uLmFyZ3MpIGFzIFByb21pc2U8XG4gICAgICBbQnVsa1N0cmluZywgQnVsa1N0cmluZ1tdXVxuICAgID47XG4gIH1cblxuICB6c2NhbihcbiAgICBrZXk6IHN0cmluZyxcbiAgICBjdXJzb3I6IG51bWJlcixcbiAgICBvcHRzPzogWlNjYW5PcHRzLFxuICApIHtcbiAgICBjb25zdCBhcmdzID0gdGhpcy5wdXNoU2Nhbk9wdHMoW2tleSwgY3Vyc29yXSwgb3B0cyk7XG4gICAgcmV0dXJuIHRoaXMuZXhlY0FycmF5UmVwbHkoXCJaU0NBTlwiLCAuLi5hcmdzKSBhcyBQcm9taXNlPFxuICAgICAgW0J1bGtTdHJpbmcsIEJ1bGtTdHJpbmdbXV1cbiAgICA+O1xuICB9XG5cbiAgcHJpdmF0ZSBwdXNoU2Nhbk9wdHMoXG4gICAgYXJnczogKG51bWJlciB8IHN0cmluZylbXSxcbiAgICBvcHRzPzogU2Nhbk9wdHMgfCBIU2Nhbk9wdHMgfCBaU2Nhbk9wdHMgfCBTU2Nhbk9wdHMsXG4gICkge1xuICAgIGlmIChvcHRzPy5wYXR0ZXJuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGFyZ3MucHVzaChcIk1BVENIXCIsIG9wdHMucGF0dGVybik7XG4gICAgfVxuICAgIGlmIChvcHRzPy5jb3VudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhcmdzLnB1c2goXCJDT1VOVFwiLCBvcHRzLmNvdW50KTtcbiAgICB9XG4gICAgaWYgKChvcHRzIGFzIFNjYW5PcHRzKT8udHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhcmdzLnB1c2goXCJUWVBFXCIsIChvcHRzIGFzIFNjYW5PcHRzKS50eXBlISk7XG4gICAgfVxuICAgIHJldHVybiBhcmdzO1xuICB9XG5cbiAgdHgoKSB7XG4gICAgcmV0dXJuIGNyZWF0ZVJlZGlzUGlwZWxpbmUodGhpcy5leGVjdXRvci5jb25uZWN0aW9uLCB0cnVlKTtcbiAgfVxuXG4gIHBpcGVsaW5lKCkge1xuICAgIHJldHVybiBjcmVhdGVSZWRpc1BpcGVsaW5lKHRoaXMuZXhlY3V0b3IuY29ubmVjdGlvbik7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZWRpc0Nvbm5lY3RPcHRpb25zIGV4dGVuZHMgUmVkaXNDb25uZWN0aW9uT3B0aW9ucyB7XG4gIGhvc3RuYW1lOiBzdHJpbmc7XG4gIHBvcnQ/OiBudW1iZXIgfCBzdHJpbmc7XG59XG5cbi8qKlxuICogQ29ubmVjdCB0byBSZWRpcyBzZXJ2ZXJcbiAqIEBwYXJhbSBvcHRpb25zXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGNvbm5lY3QgfSBmcm9tIFwiLi9tb2QudHNcIjtcbiAqIGNvbnN0IGNvbm4xID0gYXdhaXQgY29ubmVjdCh7aG9zdG5hbWU6IFwiMTI3LjAuMC4xXCIsIHBvcnQ6IDYzNzl9KTsgLy8gLT4gVENQLCAxMjcuMC4wLjE6NjM3OVxuICogY29uc3QgY29ubjIgPSBhd2FpdCBjb25uZWN0KHtob3N0bmFtZTogXCJyZWRpcy5wcm94eVwiLCBwb3J0OiA0NDMsIHRsczogdHJ1ZX0pOyAvLyAtPiBUTFMsIHJlZGlzLnByb3h5OjQ0M1xuICogYGBgXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb25uZWN0KG9wdGlvbnM6IFJlZGlzQ29ubmVjdE9wdGlvbnMpOiBQcm9taXNlPFJlZGlzPiB7XG4gIGNvbnN0IGNvbm5lY3Rpb24gPSBjcmVhdGVSZWRpc0Nvbm5lY3Rpb24ob3B0aW9ucyk7XG4gIGF3YWl0IGNvbm5lY3Rpb24uY29ubmVjdCgpO1xuICBjb25zdCBleGVjdXRvciA9IG5ldyBNdXhFeGVjdXRvcihjb25uZWN0aW9uKTtcbiAgcmV0dXJuIGNyZWF0ZShleGVjdXRvcik7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgbGF6eSBSZWRpcyBjbGllbnQgdGhhdCB3aWxsIG5vdCBlc3RhYmxpc2ggYSBjb25uZWN0aW9uIHVudGlsIGEgY29tbWFuZCBpcyBhY3R1YWxseSBleGVjdXRlZC5cbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgY3JlYXRlTGF6eUNsaWVudCB9IGZyb20gXCIuL21vZC50c1wiO1xuICpcbiAqIGNvbnN0IGNsaWVudCA9IGNyZWF0ZUxhenlDbGllbnQoeyBob3N0bmFtZTogXCIxMjcuMC4wLjFcIiwgcG9ydDogNjM3OSB9KTtcbiAqIGNvbnNvbGUuYXNzZXJ0KCFjbGllbnQuaXNDb25uZWN0ZWQpO1xuICogYXdhaXQgY2xpZW50LmdldChcImZvb1wiKTtcbiAqIGNvbnNvbGUuYXNzZXJ0KGNsaWVudC5pc0Nvbm5lY3RlZCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxhenlDbGllbnQob3B0aW9uczogUmVkaXNDb25uZWN0T3B0aW9ucyk6IFJlZGlzIHtcbiAgY29uc3QgY29ubmVjdGlvbiA9IGNyZWF0ZVJlZGlzQ29ubmVjdGlvbihvcHRpb25zKTtcbiAgY29uc3QgZXhlY3V0b3IgPSBjcmVhdGVMYXp5RXhlY3V0b3IoY29ubmVjdGlvbik7XG4gIHJldHVybiBjcmVhdGUoZXhlY3V0b3IpO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIHJlZGlzIGNsaWVudCBmcm9tIGBDb21tYW5kRXhlY3V0b3JgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoZXhlY3V0b3I6IENvbW1hbmRFeGVjdXRvcik6IFJlZGlzIHtcbiAgcmV0dXJuIG5ldyBSZWRpc0ltcGwoZXhlY3V0b3IpO1xufVxuXG4vKipcbiAqIEV4dHJhY3QgUmVkaXNDb25uZWN0T3B0aW9ucyBmcm9tIHJlZGlzIFVSTFxuICogQHBhcmFtIHVybFxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwYXJzZVVSTCB9IGZyb20gXCIuL21vZC50c1wiO1xuICpcbiAqIHBhcnNlVVJMKFwicmVkaXM6Ly9mb286YmFyQGxvY2FsaG9zdDo2Mzc5LzFcIik7IC8vIC0+IHtob3N0bmFtZTogXCJsb2NhbGhvc3RcIiwgcG9ydDogXCI2Mzc5XCIsIHRsczogZmFsc2UsIGRiOiAxLCBuYW1lOiBmb28sIHBhc3N3b3JkOiBiYXJ9XG4gKiBwYXJzZVVSTChcInJlZGlzczovLzEyNy4wLjAuMTo0NDMvP2RiPTImcGFzc3dvcmQ9YmFyXCIpOyAvLyAtPiB7aG9zdG5hbWU6IFwiMTI3LjAuMC4xXCIsIHBvcnQ6IFwiNDQzXCIsIHRsczogdHJ1ZSwgZGI6IDIsIG5hbWU6IHVuZGVmaW5lZCwgcGFzc3dvcmQ6IGJhcn1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VVUkwodXJsOiBzdHJpbmcpOiBSZWRpc0Nvbm5lY3RPcHRpb25zIHtcbiAgY29uc3Qge1xuICAgIHByb3RvY29sLFxuICAgIGhvc3RuYW1lLFxuICAgIHBvcnQsXG4gICAgdXNlcm5hbWUsXG4gICAgcGFzc3dvcmQsXG4gICAgcGF0aG5hbWUsXG4gICAgc2VhcmNoUGFyYW1zLFxuICB9ID0gbmV3IFVSTCh1cmwpO1xuICBjb25zdCBkYiA9IHBhdGhuYW1lLnJlcGxhY2UoXCIvXCIsIFwiXCIpICE9PSBcIlwiXG4gICAgPyBwYXRobmFtZS5yZXBsYWNlKFwiL1wiLCBcIlwiKVxuICAgIDogc2VhcmNoUGFyYW1zLmdldChcImRiXCIpID8/IHVuZGVmaW5lZDtcbiAgcmV0dXJuIHtcbiAgICBob3N0bmFtZTogaG9zdG5hbWUgIT09IFwiXCIgPyBob3N0bmFtZSA6IFwibG9jYWxob3N0XCIsXG4gICAgcG9ydDogcG9ydCAhPT0gXCJcIiA/IHBhcnNlSW50KHBvcnQsIDEwKSA6IDYzNzksXG4gICAgdGxzOiBwcm90b2NvbCA9PSBcInJlZGlzczpcIiA/IHRydWUgOiBzZWFyY2hQYXJhbXMuZ2V0KFwic3NsXCIpID09PSBcInRydWVcIixcbiAgICBkYjogZGIgPyBwYXJzZUludChkYiwgMTApIDogdW5kZWZpbmVkLFxuICAgIG5hbWU6IHVzZXJuYW1lICE9PSBcIlwiID8gdXNlcm5hbWUgOiB1bmRlZmluZWQsXG4gICAgcGFzc3dvcmQ6IHBhc3N3b3JkICE9PSBcIlwiXG4gICAgICA/IHBhc3N3b3JkXG4gICAgICA6IHNlYXJjaFBhcmFtcy5nZXQoXCJwYXNzd29yZFwiKSA/PyB1bmRlZmluZWQsXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVJlZGlzQ29ubmVjdGlvbihvcHRpb25zOiBSZWRpc0Nvbm5lY3RPcHRpb25zKTogQ29ubmVjdGlvbiB7XG4gIGNvbnN0IHsgaG9zdG5hbWUsIHBvcnQgPSA2Mzc5LCAuLi5vcHRzIH0gPSBvcHRpb25zO1xuICByZXR1cm4gbmV3IFJlZGlzQ29ubmVjdGlvbihob3N0bmFtZSwgcG9ydCwgb3B0cyk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUxhenlFeGVjdXRvcihjb25uZWN0aW9uOiBDb25uZWN0aW9uKTogQ29tbWFuZEV4ZWN1dG9yIHtcbiAgbGV0IGV4ZWN1dG9yOiBDb21tYW5kRXhlY3V0b3IgfCBudWxsID0gbnVsbDtcbiAgcmV0dXJuIHtcbiAgICBnZXQgY29ubmVjdGlvbigpIHtcbiAgICAgIHJldHVybiBjb25uZWN0aW9uO1xuICAgIH0sXG4gICAgYXN5bmMgZXhlYyhjb21tYW5kLCAuLi5hcmdzKSB7XG4gICAgICBpZiAoIWV4ZWN1dG9yKSB7XG4gICAgICAgIGV4ZWN1dG9yID0gbmV3IE11eEV4ZWN1dG9yKGNvbm5lY3Rpb24pO1xuICAgICAgICBhd2FpdCBjb25uZWN0aW9uLmNvbm5lY3QoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBleGVjdXRvci5leGVjKGNvbW1hbmQsIC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgY2xvc2UoKSB7XG4gICAgICBpZiAoZXhlY3V0b3IpIHtcbiAgICAgICAgcmV0dXJuIGV4ZWN1dG9yLmNsb3NlKCk7XG4gICAgICB9XG4gICAgfSxcbiAgfTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUEw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