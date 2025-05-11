# libranda-examples

Showcasing the power of the libranda stack through practical examples.

#### Setup and Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the client:
   ```bash
   npm run build
   ```
   This command uses esbuild to bundle the client-side JavaScript and its dependencies into the `html_data` directory.

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser to view the application (URL will be shown in the server console output)


## Project Structure

Each example follows this structure:
- `html_src/` - Source JavaScript files
- `html_data/` - Built/bundled files (created by build script)
- `build.js` - esbuild configuration
- `index.js` - Server implementation

## Requirements

- Node.js (v16 or higher recommended)
- npm (comes with Node.js)
