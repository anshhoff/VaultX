# VaultX

VaultX is a secure and user-friendly document management application designed to help users store, organize, and access their important documents seamlessly across devices. Built with modern technologies, VaultX ensures a smooth and intuitive user experience while maintaining top-notch security.

---

## Features

### Core Features
- **Document Storage**: Upload and store documents securely in the cloud.
- **Category Management**: Organize documents into categories like Passport, License, Certificate, etc.
- **Dark Mode**: Toggle between light and dark themes for better accessibility.
- **Cross-Platform Support**: Works seamlessly on both web and mobile platforms.
- **Offline Access**: Access locally stored documents without an internet connection.

### Additional Features
- **Document Syncing**: Automatically sync documents across devices.
- **Secure Authentication**: Powered by Supabase for secure user authentication.
- **File Preview**: Preview documents directly within the app.
- **Customizable Themes**: Switch between light and dark modes.
- **Responsive Design**: Optimized for various screen sizes.

---

## Tech Stack

### Frontend
- **React Native**: For building cross-platform mobile applications.
- **Expo**: Simplifies development and deployment.
- **TypeScript**: Ensures type safety and better developer experience.

### Backend
- **Supabase**: Provides authentication, database, and storage services.
- **SQLite**: Local database for offline access.

### Tools & Libraries
- **React Navigation**: For seamless navigation between screens.
- **Expo File System**: Handles file storage and management.
- **React Native Vector Icons**: For beautiful and consistent icons.

---

## Folder Structure

```plaintext
VaultX-qng9Eb/
├── app/                # Application screens and layouts
│   ├── (tabs)/         # Tab-based navigation screens
│   ├── (auth)/         # Authentication screens
├── components/         # Reusable UI components
├── constants/          # Theme and configuration constants
├── hooks/              # Custom React hooks
├── services/           # API and platform-specific services
├── storage/            # Local database and storage logic
├── assets/             # Static assets like images
├── scripts/            # Utility scripts
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

---

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/vaultx.git
   ```
2. Navigate to the project directory:
   ```bash
   cd vaultx
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npx expo start
   ```

---

## Usage

1. **Sign Up / Log In**: Create an account or log in using your credentials.
2. **Add Documents**: Navigate to the "Add Document" tab, select a category, and upload your document.
3. **View Documents**: Browse your documents in the "Documents" tab.
4. **Settings**: Toggle between light and dark modes, and manage your preferences.

---

## Screenshots

### Light Mode
<img width="190" height="460" alt="image" src="https://github.com/user-attachments/assets/40f55642-95be-4fc7-926c-88260444abf9" />

### Dark Mode
<img width="190" height="460" alt="image" src="https://github.com/user-attachments/assets/acf0c2f7-15ed-4b21-9cb5-4cc54962540d" />


---

## Contributing

We welcome contributions! To contribute:
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

---



Thank you for using VaultX! 🚀
