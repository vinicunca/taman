## The `effects` Directory

The `effects` directory is dedicated to code and logic involving loose coupling. It is recommended to place code in the `effects` directory if your package exhibits the following characteristics:

- **State Management**: Uses the `pinia` state management framework and includes logic for handling side effects (such as asynchronous operations or API calls).
- **User Preferences**: Uses `@taman-core/preferences` to handle user preferences, involving logic for local storage or browser caching (e.g., `localStorage`).
- **Navigation and Routing**: Handles scenarios like navigation and page transitions, requiring logic to manage route changes.
- **Component Library Dependencies**: Contains code that is tightly coupled with a specific component library or depends on large repositories.

Categorizing relevant code into the `effects` directory clarifies the project structure, making it easier to maintain and extend.
