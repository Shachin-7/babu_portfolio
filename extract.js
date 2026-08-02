const fs = require('fs');

const code = fs.readFileSync('dist/assets/index-CHsP9C4C.js', 'utf8');

// Find the _m() function which contains the macbook-section JSX string.
// We can just dump it out to read it easily.
const match = code.match(/function _m\(\)\{.*?(return i\.jsx\("section",\{id:"about",className:"macbook-section scroll-anchor".*?)\}\s*function/);
if (match) {
    fs.writeFileSync('extracted_macbook_jsx.txt', match[1]);
    console.log("Extracted JSX successfully!");
} else {
    console.log("Could not find the function.");
}
