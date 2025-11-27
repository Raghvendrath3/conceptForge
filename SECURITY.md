# Snippet Execution Security Model

## Overview
ConceptForge implements a **client-side sandboxed execution model** for JavaScript snippets. All code execution happens in the browser within a strictly sandboxed iframe, with **zero server-side execution**.

## Security Architecture

### 1. Iframe Sandbox Restrictions

```html
<iframe 
  sandbox="allow-scripts"
  srcdoc="..."
/>
```

**What this means:**
- ✅ **allow-scripts**: JavaScript execution is permitted (required for snippet functionality)
- ❌ **No allow-same-origin**: Prevents access to parent document, localStorage, cookies, IndexedDB
- ❌ **No allow-forms**: Cannot submit forms
- ❌ **No allow-popups**: Cannot open new windows
- ❌ **No allow-modals**: Cannot use alert(), confirm(), prompt()
- ❌ **No allow-top-navigation**: Cannot redirect parent window
- ❌ **No network access**: Cannot make fetch/XHR requests (blocked by CSP)

### 2. Content Security Policy (CSP)

The iframe enforces a strict CSP header:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'none'; 
               script-src 'unsafe-inline'; 
               style-src 'unsafe-inline';">
```

**Policy breakdown:**
- `default-src 'none'`: Block all resources by default
- `script-src 'unsafe-inline'`: Allow only inline scripts (user code)
- `style-src 'unsafe-inline'`: Allow only inline styles
- **No connect-src**: Network requests blocked
- **No img-src**: Cannot load external images
- **No frame-src**: Cannot embed iframes

### 3. Message Passing Security

Communication between iframe and parent uses `postMessage`:

```typescript
// Origin validation
if (e.source !== iframeRef.current?.contentWindow) {
  return; // Reject messages from unknown sources
}
```

**Security measures:**
- Only messages from the sandboxed iframe are processed
- Message type validation (log, error, warn, info only)
- No sensitive data transmitted
- One-way communication (iframe → parent)

### 4. Execution Limits

- **Timeout**: 5 seconds maximum execution time
- **No infinite loops protection**: User code can hang browser tab (isolated to iframe)
- **Memory**: Limited by browser tab memory limits
- **No persistence**: Execution state is discarded after completion

## What User Code CANNOT Do

❌ **Access parent page**
```javascript
// These will all fail:
window.parent.document // undefined
window.top.location    // blocked
localStorage           // undefined
sessionStorage         // undefined
document.cookie        // empty
```

❌ **Make network requests**
```javascript
// Blocked by CSP:
fetch('https://evil.com')  // CSP blocks
XMLHttpRequest()           // CSP blocks
<img src="...">            // CSP blocks
```

❌ **Access browser APIs**
```javascript
// Restricted or unavailable:
navigator.geolocation      // permission denied
navigator.mediaDevices     // undefined
WebSocket                  // blocked by CSP
IndexedDB                  // undefined (no same-origin)
```

❌ **Persist data**
```javascript
// No storage available:
localStorage.setItem()     // throws error
sessionStorage.setItem()   // throws error
document.cookie = "..."    // no effect
```

## What User Code CAN Do

✅ **Execute JavaScript**
```javascript
// Pure computation:
const factorial = n => n <= 1 ? 1 : n * factorial(n - 1);
console.log(factorial(5)); // 120
```

✅ **Use console methods**
```javascript
console.log('Info message');
console.error('Error message');
console.warn('Warning message');
console.info('Detail message');
```

✅ **Manipulate data structures**
```javascript
const data = [1, 2, 3, 4, 5];
const sum = data.reduce((a, b) => a + b, 0);
console.log('Sum:', sum);
```

✅ **Use built-in JavaScript features**
```javascript
// Math, Date, Array, Object, etc.
console.log(Math.random());
console.log(new Date().toISOString());
console.log(JSON.stringify({ hello: 'world' }));
```

## Security Comparison

| Feature | ConceptForge Sandbox | Unrestricted Execution |
|---------|---------------------|----------------------|
| DOM Access | ❌ No | ✅ Full |
| Network Access | ❌ Blocked | ✅ Allowed |
| Storage Access | ❌ None | ✅ Full |
| Parent Window Access | ❌ Blocked | ✅ Allowed |
| Cookie Access | ❌ None | ✅ Full |
| Console Output | ✅ Captured | ✅ Native |
| Execution Timeout | ✅ 5 seconds | ❌ Unlimited |

## Best Practices for Users

### ✅ Safe Code Examples

```javascript
// Data processing
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log(doubled);

// Algorithms
function isPrime(n) {
  if (n <= 1) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}
console.log('Is 17 prime?', isPrime(17));

// String manipulation
const text = 'Hello, World!';
console.log(text.split('').reverse().join(''));
```

### ⚠️ Code That Won't Work

```javascript
// Network requests (blocked by CSP)
fetch('/api/data')  // ❌ Blocked

// DOM manipulation (no document access)
document.getElementById('test')  // ❌ undefined

// Storage (no same-origin access)
localStorage.setItem('key', 'value')  // ❌ Error

// Infinite loops (will timeout)
while(true) {}  // ❌ Timeout after 5s
```

## Execution Logging (Optional)

Users can optionally save execution logs via:
```
POST /api/nodes/:id/run
{
  "code": "console.log('test')",
  "output": ["[LOG] test"]
}
```

**Important:** Logs are NOT automatically persisted. This is an opt-in feature that requires:
- Authenticated request
- Node must be type "snippet"
- User must own the node

## Additional Recommendations

### For Production Deployment

1. **Enable CSP headers on parent page**:
   ```
   Content-Security-Policy: frame-src 'self'; frame-ancestors 'self';
   ```

2. **Rate limit execution requests** (if logging is enabled)

3. **Monitor execution logs** for abuse patterns

4. **Consider adding**:
   - Resource usage monitoring
   - Execution count limits per user
   - Code review for shared snippets

### For Advanced Users

For more complex execution needs, consider:
- Using web workers for parallel execution
- Implementing AST-based code analysis
- Adding TypeScript sandbox support
- Integrating with code quality tools (ESLint, etc.)

## Conclusion

The ConceptForge snippet execution model prioritizes **security over capability**. By executing all user code client-side in a heavily restricted sandbox, we eliminate entire classes of security vulnerabilities while still providing a useful code playground for learning and experimentation.

**Key principle**: Never trust user code. Always assume malicious intent and design defenses accordingly.
