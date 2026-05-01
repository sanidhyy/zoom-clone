<a name="readme-top"></a>

# Yoom - Modern Next.js powered Video calling app

![Yoom - Modern Next.js powered Video calling app](/.github/images/img_main.png "Yoom - Modern Next.js powered Video calling app")

[![Ask Me Anything!](https://flat.badgen.net/static/Ask%20me/anything?icon=github&color=black&scale=1.01)](https://github.com/sanidhyy "Ask Me Anything!")
[![GitHub license](https://flat.badgen.net/github/license/sanidhyy/zoom-clone?icon=github&color=black&scale=1.01)](https://github.com/sanidhyy/zoom-clone/blob/main/LICENSE "GitHub license")
[![Maintenance](https://flat.badgen.net/static/Maintained/yes?icon=github&color=black&scale=1.01)](https://github.com/sanidhyy/zoom-clone/commits/main "Maintenance")
[![GitHub branches](https://flat.badgen.net/github/branches/sanidhyy/zoom-clone?icon=github&color=black&scale=1.01)](https://github.com/sanidhyy/zoom-clone/branches "GitHub branches")
[![Github commits](https://flat.badgen.net/github/commits/sanidhyy/zoom-clone?icon=github&color=black&scale=1.01)](https://github.com/sanidhyy/zoom-clone/commits "Github commits")
[![GitHub issues](https://flat.badgen.net/github/issues/sanidhyy/zoom-clone?icon=github&color=black&scale=1.01)](https://github.com/sanidhyy/zoom-clone/issues "GitHub issues")
[![GitHub pull reUpcoming Meetings](https://flat.badgen.net/github/prs/sanidhyy/zoom-clone?icon=github&color=black&scale=1.01)](https://github.com/sanidhyy/zoom-clone/pulls "GitHub pull reUpcoming Meetings")
[![Netlify Status](https://api.netlify.com/api/v1/badges/2076d95e-3495-4baf-854d-f59283f80b27/deploy-status)](https://clone-yoom.netlify.app/ "Netlify Status")

<!-- Table of Contents -->
<details>

<summary>

# :notebook_with_decorative_cover: Table of Contents

</summary>

- [Folder Structure](#bangbang-folder-structure)
- [Getting Started](#toolbox-getting-started)
- [Screenshots](#camera-screenshots)
- [Tech Stack](#gear-tech-stack)
- [Stats](#wrench-stats)
- [Contribute](#raised_hands-contribute)
- [Acknowledgements](#gem-acknowledgements)
- [Buy Me a Coffee](#coffee-buy-me-a-coffee)
- [Follow Me](#rocket-follow-me)
- [Learn More](#books-learn-more)
- [Deploy on Netlify](#page_with_curl-deploy-on-netlify)
- [Give A Star](#star-give-a-star)
- [Star History](#star2-star-history)
- [Give A Star](#star-give-a-star)

</details>

## :bangbang: Folder Structure

Here is the folder structure of this app.

<!--- FOLDER_STRUCTURE_START --->
```bash
zoom-clone/
  |- actions/
    |-- stream.actions.ts
  |- app/
    |-- (auth)/
    |-- (root)/
    |-- apple-icon.png
    |-- favicon.ico
    |-- globals.css
    |-- icon1.png
    |-- icon2.png
    |-- layout.tsx
  |- components/
    |-- modals/
    |-- ui/
    |-- call-list.tsx
    |-- end-call-button.tsx
    |-- home-card.tsx
    |-- loader.tsx
    |-- meeting-card.tsx
    |-- meeting-room.tsx
    |-- meeting-setup.tsx
    |-- meeting-type-list.tsx
    |-- mobile-nav.tsx
    |-- navbar.tsx
    |-- sidebar.tsx
  |- config/
    |-- index.ts
  |- constants/
    |-- index.ts
  |- hooks/
    |-- use-get-call-by-id.ts
    |-- use-get-calls.ts
  |- lib/
    |-- utils.ts
  |- providers/
    |-- stream-client-provider.tsx
  |- public/
  |- .env.example
  |- .env/.env.local
  |- .eslintrc.json
  |- .gitignore
  |- .prettierrc.json
  |- bun.lockb
  |- components.json
  |- environment.d.ts
  |- middleware.ts
  |- netlify.toml
  |- next.config.mjs
  |- package.json
  |- postcss.config.mjs
  |- tailwind.config.ts
  |- tsconfig.json
```
<!--- FOLDER_STRUCTURE_END --->

<br />

## :toolbox: Getting Started

1. Make sure **Git** and **NodeJS** is installed.
2. Clone this repository to your local computer.
3. Create `.env.local` file in **root** directory.
4. Contents of `.env.local`:

```env
# .env.local

# disabled next.js telemetry
NEXT_TELEMETRY_DISABLED=1

# clerk auth keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
CLERK_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# clerk auth redirect urls
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# stream api keys
NEXT_PUBLIC_STREAM_API_KEY=xxxxxxxxxxxxxxxxxxxxxx
STREAM_SECRET_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# app base url
NEXT_PUBLIC_BASE_URL=http://localhost:3000

```

### 5. Obtain Clerk Authentication Keys

1.  **Source**: Clerk Dashboard or Settings Page
2.  **Procedure**:
    - Log in to your Clerk account.
    - Navigate to the dashboard or settings page.
    - Look for the section related to authentication keys.
    - Copy the `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` provided in that section.

### 6. Specify Public App URL

1.  **Procedure**:
    - Replace `http://localhost:3000` with the URL of your deployed application.

### 7. Set Up Stream

1. **Create a Stream Account**:

   - If you don't have a Stream account, sign up at [GetStream.io](https://getstream.io/).

2. **Create a New App**:
   - After logging in, navigate to the Stream dashboard.
   - Click on "Create App" to set up a new application for Zoom-Clone.
   - Provide a name for your app and select the appropriate region.

### 8. Obtain the Stream API Key and Secret Key

1. **Navigate to the App Settings**:

   - In your Stream dashboard, select the app you created for Zoom-Clone.
   - Go to the "Overview" or "Keys" section.

2. **Copy the API Key**:

   - You will find the "API Key" listed in the app details. Copy this key.

3. **Copy the Secret Key**:
   - In the same section, you will find the "Secret Key". Copy this key as well.

### 9. Save and Secure:

- Save the changes to the `.env.local` file.

10. Install Project Dependencies using `npm install --legacy-peer-deps` or `yarn install --legacy-peer-deps`.

11. Now app is fully configured 👍 and you can start using this app using either one of `npm run dev` or `yarn dev`.

**NOTE:** Please make sure to keep your API keys and configuration values secure and do not expose them publicly.

## :camera: Screenshots

![Modern UI/UX](/.github/images/img1.png "Modern UI/UX")

![Upcoming Meetings](/.github/images/img2.png "Upcoming Meetings")

![Live Audio/Video Call](/.github/images/img3.png "Live Audio/Video Call")

![View Recordings](/.github/images/img4.png "View Recordings")

## :gear: Tech Stack

[![React JS](https://skillicons.dev/icons?i=react "React JS")](https://react.dev/ "React JS") [![Next JS](https://skillicons.dev/icons?i=next "Next JS")](https://nextjs.org/ "Next JS") [![Typescript](https://skillicons.dev/icons?i=ts "Typescript")](https://www.typescriptlang.org/ "Typescript") [![Tailwind CSS](https://skillicons.dev/icons?i=tailwind "Tailwind CSS")](https://tailwindcss.com/ "Tailwind CSS") [![Vercel](https://skillicons.dev/icons?i=vercel "Vercel")](https://vercel.app/ "Vercel")

## :wrench: Stats

[![Stats for Yoom](/.github/images/stats.svg "Stats for Yoom")](https://pagespeed.web.dev/analysis?url=https://clone-yoom.netlify.app "Stats for Yoom")

## :raised_hands: Contribute

You might encounter some bugs while using this app. You are more than welcome to contribute. Just submit changes via pull request and I will review them before merging. Make sure you follow community guidelines.

## :gem: Acknowledgements

Useful resources and dependencies that are used in Yoom.

<!--- DEPENDENCIES_START --->
- [@clerk/nextjs](https://www.npmjs.com/package/@clerk/nextjs): ^5.7.5
- [@radix-ui/react-dialog](https://www.npmjs.com/package/@radix-ui/react-dialog): ^1.1.15
- [@radix-ui/react-dropdown-menu](https://www.npmjs.com/package/@radix-ui/react-dropdown-menu): ^2.1.16
- [@radix-ui/react-slot](https://www.npmjs.com/package/@radix-ui/react-slot): ^1.2.4
- [@radix-ui/react-toast](https://www.npmjs.com/package/@radix-ui/react-toast): ^1.2.15
- [@stream-io/node-sdk](https://www.npmjs.com/package/@stream-io/node-sdk): ^0.7.50
- [@stream-io/video-react-sdk](https://www.npmjs.com/package/@stream-io/video-react-sdk): ^1.36.0
- [@types/node](https://www.npmjs.com/package/@types/node): ^25
- [@types/react](https://www.npmjs.com/package/@types/react): ^19
- [@types/react-datepicker](https://www.npmjs.com/package/@types/react-datepicker): ^7.0.0
- [@types/react-dom](https://www.npmjs.com/package/@types/react-dom): ^19
- [class-variance-authority](https://www.npmjs.com/package/class-variance-authority): ^0.7.1
- [clsx](https://www.npmjs.com/package/clsx): ^2.1.1
- [eslint](https://www.npmjs.com/package/eslint): ^10
- [eslint-config-next](https://www.npmjs.com/package/eslint-config-next): 16.2.2
- [eslint-plugin-unused-imports](https://www.npmjs.com/package/eslint-plugin-unused-imports): ^4.4.1
- [lucide-react](https://www.npmjs.com/package/lucide-react): ^1.14.0
- [next](https://www.npmjs.com/package/next): 15.5.15
- [postcss](https://www.npmjs.com/package/postcss): ^8.5.13
- [prettier](https://www.npmjs.com/package/prettier): ^3.8.1
- [prettier-plugin-tailwindcss](https://www.npmjs.com/package/prettier-plugin-tailwindcss): ^0.7.2
- [react](https://www.npmjs.com/package/react): ^19
- [react-datepicker](https://www.npmjs.com/package/react-datepicker): ^8.10.0
- [react-dom](https://www.npmjs.com/package/react-dom): ^19
- [tailwind-merge](https://www.npmjs.com/package/tailwind-merge): ^3.5.0
- [tailwindcss](https://www.npmjs.com/package/tailwindcss): ^3.4.18
- [tailwindcss-animate](https://www.npmjs.com/package/tailwindcss-animate): ^1.0.7
- [typescript](https://www.npmjs.com/package/typescript): ^5.9.3

<!--- DEPENDENCIES_END --->

## :coffee: Buy Me a Coffee

[<img src="https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" width="200" />](https://www.buymeacoffee.com/sanidhy "Buy me a Coffee")

## :rocket: Follow Me

[![Follow Me](https://img.shields.io/github/followers/sanidhyy?style=social&label=Follow&maxAge=2592000)](https://github.com/sanidhyy "Follow Me")
[![Tweet about this project](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fx.com%2F_sanidhyy)](https://x.com/intent/tweet?text=Check+out+this+amazing+app:&url=https%3A%2F%2Fgithub.com%2Fsanidhyy%2Fzoom-clone "Tweet about this project")

## :books: Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## :page_with_curl: Deploy on Netlify

The simplest way to deploy your React.js app is to use the [Netlify Platform](https://app.netlify.com/start) - a powerful platform for modern web projects.

Explore the [Netlify deployment documentation](https://docs.netlify.com/site-deploys/create-deploys) for step-by-step instructions on deploying your React.js app on Netlify.

Happy coding, and feel free to share your thoughts and improvements with the [Netlify community](https://community.netlify.com)!

## :star: Give A Star

You can also give this repository a star to show more people and they can use this repository.

## :star2: Star History

<a href="https://star-history.com/#sanidhyy/zoom-clone&Timeline">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=sanidhyy/zoom-clone&type=Timeline&theme=dark" />
  <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=sanidhyy/zoom-clone&type=Timeline" />
  <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=sanidhyy/zoom-clone&type=Timeline" />
</picture>
</a>

<br />
<p align="right">(<a href="#readme-top">back to top</a>)</p>
