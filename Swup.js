const crypto = require('crypto');

class Swup {
    constructor(publicKey, privateKey, locale = 'en') {
        this.baseUrl = 'https://api.swup.ai/';
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.locale = locale;
    }

    async currencies() {
        return this.get('merchant/currencies');
    }

    async balances() {
        return this.get('merchant/balances');
    }

    async exchangeRates() {
        return this.get('merchant/exchange-rates');
    }

    async getWithdrawalById(id) {
        return this.get(`merchant/withdrawals/${id}`);
    }

    async getWithdrawalByExternalId(externalId) {
        return this.get('merchant/withdrawals/find-one', { externalId });
    }

    async createCryptoWithdrawal(data) {
        return this.post('merchant/withdrawals', data);
    }

    async createFiatWithdrawal(data) {
        return this.post('merchant/withdrawals/fiat', data);
    }

    async createExchange(data) {
        return this.post('merchant/exchange', data);
    }

    async getExchangeByExternalId(externalId) {
        return this.get('merchant/exchanges/find-one', { externalId });
    }

    async getExchangeById(id) {
        return this.get(`merchant/exchanges/${id}`);
    }

    async getExchangeEstimatedAmount(params) {
        return this.get('merchant/exchanges/estimated-amount', params);
    }

    async getExchangeMinAmount(params) {
        return this.get('merchant/exchanges/min-amount', params);
    }

    async createInvoice(data) {
        return this.post('merchant/invoices', data);
    }

    async getInvoiceById(id) {
        return this.get(`merchant/invoices/${id}`);
    }

    async post(endpoint, data) {
        const url = this.baseUrl + endpoint;
        const response = await fetch(url, {
            method: 'POST',
            headers: this.headers(data),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            await this.handleErrorResponse(response);
        }

        return response.json();
    }

    async get(endpoint, params = {}) {
        const url = new URL(this.baseUrl + endpoint);
        url.search = new URLSearchParams(params).toString();

        const response = await fetch(url, {
            method: 'GET',
            headers: this.headers(),
        });

        if (!response.ok) {
            await this.handleErrorResponse(response);
        }

        return response.json();
    }

    headers(data = {}) {
        const nonce = crypto.randomUUID().toString();

        return {
            'x-nonce': nonce,
            'accept': 'application/json',
            'content-type': 'application/json',
            'x-merchant-id': this.publicKey,
            'Accept-Language': this.locale,
            'x-merchant-signature': this.createSign(nonce, data),
        };
    }

    createSign(nonce, payload) {
        const str = `${nonce}${JSON.stringify(payload)}`;

        const hmac = crypto.createHmac('sha256', this.privateKey);

        return hmac.update(Buffer.from(str, 'utf-8')).digest('hex');
    }

    async handleErrorResponse(response) {
        const responseText = await response.text();

        throw new Error(`HTTP error! status: ${response.status}, response: ${responseText}`);
    }
}

module.exports = Swup;