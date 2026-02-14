const extractUrls = require('./extractUrls');

describe('extractUrls', () => {
    test('returns empty array when text contains no URLs', () => {
        expect(extractUrls('Hello world, no links here')).toEqual([]);
    });

    test('returns empty array for empty string', () => {
        expect(extractUrls('')).toEqual([]);
    });

    test('extracts a single HTTP URL', () => {
        const text = 'Check out http://example.com for more';
        expect(extractUrls(text)).toEqual(['http://example.com']);
    });

    test('extracts a single HTTPS URL', () => {
        const text = 'Visit https://secure.example.com/page';
        expect(extractUrls(text)).toEqual(['https://secure.example.com/page']);
    });

    test('extracts multiple URLs from text', () => {
        const text = 'See http://one.com and https://two.com/path for info';
        expect(extractUrls(text)).toEqual([
            'http://one.com',
            'https://two.com/path',
        ]);
    });

    test('extracts URLs with query parameters and fragments', () => {
        const text = 'Link: https://example.com/search?q=test&lang=da#results';
        expect(extractUrls(text)).toEqual([
            'https://example.com/search?q=test&lang=da#results',
        ]);
    });

    test('extracts URLs from mixed text and HTML content', () => {
        const text = '<a href="https://blog.example.com/post">Read more</a> or visit http://other.com';
        const urls = extractUrls(text);
        expect(urls).toContain('https://blog.example.com/post">Read');
        expect(urls).toContain('http://other.com');
    });

    test('ignores text that looks like a URL but has no protocol', () => {
        const text = 'Go to www.example.com for details';
        expect(extractUrls(text)).toEqual([]);
    });

    test('handles URLs at start and end of string', () => {
        const text = 'https://start.com is great and so is https://end.com';
        expect(extractUrls(text)).toEqual([
            'https://start.com',
            'https://end.com',
        ]);
    });
});
