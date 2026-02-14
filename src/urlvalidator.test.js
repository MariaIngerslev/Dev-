const { validateUrls } = require('./urlvalidator');

describe('validateUrls', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('blacklisted URLs', () => {
        test('malware.example.com is blocked', () => {
            const [result] = validateUrls(['https://malware.example.com/path']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('blacklisted');
        });

        test('phishing.example.com is blocked', () => {
            const [result] = validateUrls(['https://phishing.example.com']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('blacklisted');
        });

        test('bad-reputation.com is blocked', () => {
            const [result] = validateUrls(['http://bad-reputation.com/page']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('blacklisted');
        });

        test('virus.exe is blocked', () => {
            const [result] = validateUrls(['http://virus.exe/malware']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('blacklisted');
        });

        test('blacklist check is case-insensitive', () => {
            const [result] = validateUrls(['http://VIRUS.EXE/payload']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('blacklisted');
        });

        test('blacklist matches hostname only, not path', () => {
            // safe.com is not blacklisted even if path contains a blacklisted name
            jest.spyOn(Math, 'random').mockReturnValue(0.99);
            const [result] = validateUrls(['https://safe.com/malware.example.com']);
            expect(result.safe).toBe(true);
            expect(result.reason).toBe('simulated_check');
        });
    });

    describe('simulated check with Math.random mocking', () => {
        test('returns safe when random value exceeds threshold (0.3)', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.5);
            const [result] = validateUrls(['https://unknown-site.com']);
            expect(result.safe).toBe(true);
            expect(result.reason).toBe('simulated_check');
        });

        test('returns unsafe when random value is at the threshold (0.3)', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.3);
            const [result] = validateUrls(['https://unknown-site.com']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('simulated_check');
        });

        test('returns unsafe when random value is below threshold', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.1);
            const [result] = validateUrls(['https://another-site.org']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('simulated_check');
        });

        test('returns safe when random value is just above threshold', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.31);
            const [result] = validateUrls(['https://borderline.net']);
            expect(result.safe).toBe(true);
            expect(result.reason).toBe('simulated_check');
        });
    });

    describe('malformed URLs', () => {
        test('returns malformed for a string without protocol', () => {
            const [result] = validateUrls(['not-a-valid-url']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('malformed');
        });

        test('returns malformed for an empty string', () => {
            const [result] = validateUrls(['']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('malformed');
        });

        test('returns malformed for garbage input', () => {
            const [result] = validateUrls(['://missing-scheme']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('malformed');
        });
    });

    describe('multiple URLs', () => {
        test('validates multiple URLs in a single call', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.99);
            const results = validateUrls([
                'https://safe-site.com',
                'https://malware.example.com',
                'not-a-url',
            ]);

            expect(results).toHaveLength(3);
            expect(results[0]).toEqual({ url: 'https://safe-site.com', safe: true, reason: 'simulated_check' });
            expect(results[1]).toEqual({ url: 'https://malware.example.com', safe: false, reason: 'blacklisted' });
            expect(results[2]).toEqual({ url: 'not-a-url', safe: false, reason: 'malformed' });
        });

        test('returns empty array for empty input', () => {
            const results = validateUrls([]);
            expect(results).toEqual([]);
        });
    });

    describe('result structure', () => {
        test('each result contains url, safe, and reason fields', () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.99);
            const [result] = validateUrls(['https://example.com']);
            expect(result).toHaveProperty('url', 'https://example.com');
            expect(result).toHaveProperty('safe', true);
            expect(result).toHaveProperty('reason', 'simulated_check');
        });

        test('preserves the original URL string in the result', () => {
            const originalUrl = 'https://MALWARE.EXAMPLE.COM/Some/Path?q=1';
            const [result] = validateUrls([originalUrl]);
            expect(result.url).toBe(originalUrl);
        });
    });
});
