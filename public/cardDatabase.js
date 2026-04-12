(function () {
    const CACHE_KEY = 'rb_riftcodex_v4';
    const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

    let _map = null;
    let _list = null;
    let _promise = null;

    function readCache() {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            const { timestamp, cards } = JSON.parse(raw);
            if (Date.now() - timestamp > CACHE_TTL_MS) return null;
            return cards;
        } catch { return null; }
    }

    function writeCache(cards) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), cards }));
        } catch { /* quota exceeded */ }
    }

    function buildIndex(cards) {
        const map = new Map();
        const list = [];
        for (const card of cards) {
            if (!card.name) continue;
            if (card.riftbound_id) map.set(card.riftbound_id, card);
            map.set(card.name.toLowerCase(), card);
            if (card.metadata && card.metadata.clean_name) {
                map.set(card.metadata.clean_name.toLowerCase(), card);
            }
            list.push(card);
        }
        return { map, list };
    }

    async function loadCards() {
        if (_map) return _map;
        if (_promise) return _promise;

        _promise = (async () => {
            try {
                const cached = readCache();
                if (cached) {
                    const { map, list } = buildIndex(cached);
                    _map = map; _list = list;
                    return _map;
                }

                const res = await fetch('/cards.json');
                if (!res.ok) throw new Error(`Failed to load cards.json: HTTP ${res.status}`);
                const cards = await res.json();

                if (cards.length) writeCache(cards);
                const { map, list } = buildIndex(cards);
                _map = map; _list = list;
                return _map;
            } catch (e) {
                console.error('RiftCodex error:', e);
                _map = null; _list = null; _promise = null;
                return new Map();
            }
        })();

        return _promise;
    }

    function getCard(idOrName) {
        if (!_map || !idOrName) return null;
        if (_map.has(idOrName)) return _map.get(idOrName);
        const lower = idOrName.toLowerCase();
        if (_map.has(lower)) return _map.get(lower);
        const firstWord = lower.split(',')[0].trim();
        for (const [key, val] of _map) {
            if (typeof key === 'string' && !key.includes('-')) {
                if (key === firstWord || key.startsWith(firstWord + ',') || key.startsWith(firstWord + ' ')) return val;
            }
        }
        return null;
    }

    function getCardImageUrl(nameOrId, localFallback) {
        const card = (_map && _map.get(nameOrId)) || getCard(nameOrId);
        if (card && card.media && card.media.image_url) return card.media.image_url;
        return localFallback || null;
    }

    function getAllCards() {
        return _list || [];
    }

    function isBaseCard(card) {
        const m = card.metadata;
        if (!m) return false;
        if (m.alternate_art || m.overnumbered || m.signature) return false;
        if (/\(.+\)/.test(card.name)) return false;
        return true;
    }

    function getCardsByType() {
        const groups = { Legend: [], Unit: [], Spell: [], Gear: [], Champion: [], Rune: [], Battlefield: [] };
        const seenNames = new Set();
        for (const card of (_list || [])) {
            if (!isBaseCard(card)) continue;
            if (seenNames.has(card.name)) continue;
            seenNames.add(card.name);
            const type = card.classification && card.classification.type;
            if (type && groups[type]) groups[type].push(card);
        }
        return groups;
    }

    function getLatestSet() {
        let latestDate = null, latestLabel = null;
        for (const card of (_list || [])) {
            const updatedOn = card.metadata && card.metadata.updated_on;
            const label = card.set && card.set.label;
            if (!updatedOn || !label) continue;
            const d = new Date(updatedOn);
            if (!latestDate || d > latestDate) {
                latestDate = d;
                latestLabel = label;
            }
        }
        return latestLabel;
    }

    window.RiftCodex = { loadCards, getCard, getCardImageUrl, getAllCards, getCardsByType, getLatestSet };
})();
