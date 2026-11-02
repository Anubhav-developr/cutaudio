# 🎧 AudioTrim — Online Audio Trimmer

**AudioTrim** is a simple, modern and lightweight audio trimming application built using React. It allows users to upload audio, visualise its waveform, select specific portions and export the trimmed audio without installing any software.

The application processes audio directly in the browser, ensuring privacy and convenience.

## ✨ Features

- **Audio Upload:** Supports audio files such as MP3, WAV, OGG, M4A and other browser-compatible formats.
- **Waveform Visualisation:** Displays the audio waveform for easy and precise editing.
- **Interactive Trimming:** Adjust the start and end points directly on the waveform.
- **Zoom Controls:** Zoom in and out to work on specific portions of audio.
- **Playback Preview:** Listen to the selected portion before exporting.
- **Playhead Indicator:** Visual indicator showing the current playback position.
- **Audio Export:** Download the trimmed audio as a WAV file.
- **Responsive Interface:** Works across desktop and mobile screen sizes.
- **Privacy Friendly:** Audio processing takes place locally in the browser. Audio files are not uploaded to any server.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| Vite | Development server and build tool |
| JavaScript | Application logic and audio processing |
| Web Audio API | Audio decoding, playback and processing |
| HTML Canvas | Waveform rendering |
| Lucide React | Icons |
| CSS | Styling and responsive layout |
| pnpm | Package management |

## 📋 Prerequisites

Before running the project, ensure that the following are installed:

- Node.js (v20 or later recommended)
- pnpm
- Git
- WSL2 (for Windows users who prefer a Linux development environment)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Anubhav-developr/audio-trimmer.git
```

### 2. Navigate to the project directory

```bash
cd audio-trimmer
```

### 3. Install dependencies

```bash
pnpm install
```

### 4. Start the development server

```bash
pnpm dev
```

### 5. Open in your browser

Visit:

```text
http://localhost:5173
```

## 📦 Production Build

To create an optimised production build:

```bash
pnpm build
```

The generated production files will be available in the `dist/` directory.

To preview the production build locally:

```bash
pnpm preview
```

## ☁️ Deployment on Cloudflare Pages

AudioTrim can be deployed for free using Cloudflare Pages.

### Method 1: Deploy using GitHub (Recommended)

#### Step 1: Push your project to GitHub

Ensure that your project is available in a GitHub repository and all the latest changes have been pushed.

```bash
git add .
git commit -m "Prepare AudioTrim for deployment"
git push origin master
```

If your default branch is `main`, use `main` instead of `master`.

#### Step 2: Open Cloudflare Dashboard

Visit:

https://dash.cloudflare.com/

Sign in to your Cloudflare account.

#### Step 3: Create a Cloudflare Pages project

1. Navigate to **Workers & Pages**.
2. Click **Create** or **Create application**.
3. Select **Pages**.
4. Choose **Connect to Git**.
5. Connect your GitHub account.
6. Select your `audio-trimmer` repository.

#### Step 4: Configure the build settings

Use the following configuration:

| Setting | Value |
|---|---|
| Project name | `audio-trim` |
| Production branch | `master` or `main` |
| Framework preset | Vite |
| Build command | `pnpm build` |
| Build output directory | `dist` |
| Root directory | `/` |

If Cloudflare asks for a Node.js version, select a version compatible with your project's dependencies.

#### Step 5: Deploy

Click **Save and Deploy**.

Cloudflare Pages will automatically install the dependencies, build the React application and deploy it.

Once the deployment is complete, your website will be available at a URL similar to:

```text
https://audio-trim.pages.dev
```

Congratulations! Your AudioTrim application is now live.

### Method 2: Deploy using Wrangler CLI

Alternatively, you can deploy directly from your terminal.

Install Wrangler:

```bash
pnpm add -D wrangler
```

Build the application:

```bash
pnpm build
```

Authenticate with Cloudflare:

```bash
pnpm exec wrangler login
```

Deploy the production build:

```bash
pnpm exec wrangler pages deploy dist
```

Follow the prompts to create or select your Cloudflare Pages project.

## 🔒 Privacy

AudioTrim is designed with privacy in mind.

- Audio files are processed locally in the user's browser.
- No audio upload to an external server is required.
- Audio content is not stored in a cloud database.
- Exported audio is generated directly in the browser.

## 📁 Project Structure

```text
audio-trimmer/
├── public/
├── src/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
├── package.json
├── pnpm-lock.yaml
├── vite.config.js
└── README.md
```

## 🤝 Contributing

Contributions, suggestions and bug reports are welcome.

1. Fork the repository.
2. Create a new feature branch.
3. Make your changes.
4. Commit and push your changes.
5. Submit a Pull Request.

## 📄 Licence

This project is open source. A licence may be added to the repository to specify the terms of use and distribution.

## 👨‍💻 Author

**Anubhav Mishra**

GitHub: [@Anubhav-developr](https://github.com/Anubhav-developr)

---

*Built with ❤️ using React and Web Audio API.*
