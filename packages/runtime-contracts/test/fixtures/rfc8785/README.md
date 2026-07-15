# RFC 8785 fixture attribution

The `cyberphone-sample` vector is the small JavaScript sample published by the Cyberphone JSON Canonicalization project and reproduced from its README. The canonical output follows RFC 8785 JCS serialization rules.

The `rfc8785-utf16-property-order` vector is the exact property-name example from RFC 8785 section 3.2.3. Its `expectedOrder` records the RFC's required UTF-16 code-unit order: carriage return, `1`, U+0080, U+00F6, U+20AC, the grinning-face surrogate pair, and U+FB33. The test checks that the pinned canonicalization dependency emits those keys in that order without introducing an independently invented canonical output.

- RFC 8785: https://www.rfc-editor.org/rfc/rfc8785.html
- Cyberphone reference project: https://github.com/cyberphone/json-canonicalization
- Project license: Apache-2.0
