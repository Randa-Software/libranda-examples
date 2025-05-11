export class LibrandaClient {
    constructor(options = {}) {
        this.url = options.url || `ws://${window.location.host}`;
        this.autoReconnect = options.autoReconnect !== false;
        this.reconnectInterval = options.reconnectInterval || 5000;
        this.eventHandlers = new Map(); // namespace -> Map(event -> Set(callbacks))
        this.ws = null;
        this.isConnecting = false;
        this.reconnectTimer = null;
        this.clientId = null;
        this.metadata = {};
        this.onReady = null;
    }

    connect() {
        if (this.ws && 
            (this.ws.readyState === WebSocket.CONNECTING || 
             this.ws.readyState === WebSocket.OPEN)) {
            return;
        }

        if (this.isConnecting) {
            return;
        }

        this.isConnecting = true;
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            this.isConnecting = false;
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
            this._handleEvent("system", "connected", null);
        };

        this.ws.onclose = () => {
            this.isConnecting = false;
            this.clientId = null;
            this._handleEvent("system", "disconnected", null);
            if (this.autoReconnect) {
                this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectInterval);
            }
        };

        this.ws.onerror = (error) => {
            this._handleEvent("system", "error", error);
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.namespace && message.event) {
                    // Handle system init message that provides client ID
                    if (message.namespace === "system" && message.event === "init") {
                        this.clientId = message.data.clientId;
                        // If there's a ready callback, execute it
                        if (this.onReady) {
                            this.onReady(this.clientId);
                        }
                    }
                    this._handleEvent(message.namespace, message.event, message.data);
                }
            } catch (error) {
                console.error("Failed to parse WebSocket message:", error);
            }
        };
    }

    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.ws) {
            this.autoReconnect = false;
            this.ws.close();
            this.ws = null;
            this.clientId = null;
        }
    }

    registerEvent(namespace, event, callback) {
        if (!this.eventHandlers.has(namespace)) {
            this.eventHandlers.set(namespace, new Map());
        }
        const namespaceHandlers = this.eventHandlers.get(namespace);

        if (!namespaceHandlers.has(event)) {
            namespaceHandlers.set(event, new Set());
        }
        const eventCallbacks = namespaceHandlers.get(event);

        eventCallbacks.add(callback);
        return () => eventCallbacks.delete(callback);
    }

    send(namespace, event, data = {}) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error("WebSocket is not connected");
        }

        this.ws.send(JSON.stringify({
            namespace,
            event,
            data: {
                ...data,
                metadata: this.metadata
            }
        }));
    }

    setMetadata(metadata) {
        this.metadata = { ...this.metadata, ...metadata };
    }

    getMetadata() {
        return { ...this.metadata };
    }

    ready(callback) {
        if (this.clientId) {
            callback(this.clientId);
        } else {
            this.onReady = callback;
        }
    }

    _handleEvent(namespace, event, data) {
        const namespaceHandlers = this.eventHandlers.get(namespace);
        if (!namespaceHandlers) return;

        const eventCallbacks = namespaceHandlers.get(event);
        if (!eventCallbacks) return;

        for (const callback of eventCallbacks) {
            try {
                callback(data);
            } catch (err) {
                console.error(`Error in event handler (${namespace}:${event}):`, err);
            }
        }
    }

    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    getId() {
        return this.clientId;
    }
}