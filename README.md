# Techtest-up

====Basic Architecture====

## Frontend
The frontend is a React application served via http-server from a Docker container. This service handles all static content and user interactions, and it establishes WebSocket connections to the backend for real-time communication.

## Backend
The backend is a Node.js server written in Typescript running an API and handling WebSocket connections for real-time data exchange and is containerized using Docker

## Database
The backend is setup to connect to a MongoDB database inside a Docker container using mongoose

## Env files
Environment Configuration: Environment variables are used to configure both the frontend and backend applications, including ports, secure socket settings, and other service-specific options. Docker Compose is utilized to simplify the setup and management of these services.

## Disclaimer
This project is a proprietary software developed by David Savage. The code in this repository is provided solely for personal review and educational purposes. **Commercial use, distribution, modification, or any other use without explicit permission from the author is strictly prohibited.**

## License
This project is licensed under a **Proprietary License**. See the [LICENSE](./LICENSE) file for detailed information.

### Key Points:
- **Personal/Educational Use Only**: You are allowed to view and study the code for personal and educational purposes.
- **No Commercial Use**: You may not use this code, in whole or in part, for any commercial purpose without prior written consent from the author.
- **No Modification/Distribution**: You may not modify, merge, distribute, sublicense, or sell copies of the software.

## Contact
For inquiries, requests, or permissions, please contact [davidsavage844@gmail.com].
