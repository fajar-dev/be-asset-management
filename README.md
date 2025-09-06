# 📦 Backend Asset Management 

Backend service for the **Asset Management System**  built with **NestJS**, **MySQL**.

---

## 🚀 Tech Stack
- [NestJS](https://nestjs.com/) - Node.js framework for scalable server-side apps  
- [MySQL](https://www.mysql.com/) - Relational Database  
- [TypeORM](https://typeorm.io/) - ORM for database management  
- [Docker](https://www.docker.com/) - Containerization  


---

## ⚙️ Setup & Installation

### 1️⃣ Clone Repository
```bash
git clone https://github.com/fajar-dev/be-asset-management.git
cd be-asset-management
```

### 2️⃣ Environment Variables
Copy the `.env.example` file in the project root and rename it to `.env`:

### 3️⃣ Run with Docker
```bash
docker compose up -d
```

### 4️⃣ Run without Docker (optional)
```bash
npm install
npm run start:dev
```

## 📖 API Documentation
- Base URL: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/api/docs`

---

## 🛠️ Features
- ✅ CRUD Asset  
- ✅ CRUD Category (with location, maintenance, and holder options)  
- ✅ User Authentication (JWT)  
- ✅ Soft Delete support  
- ✅ Dockerized for easy deployment  

---

## 👨‍💻 Development
```bash
# Format code
npm run format

# Lint check
npm run lint

# Run tests
npm run test
```

---

## 📌 Notes
- Ensure **Docker** & **Docker Compose** are installed.  
- Run `docker compose up -d` before starting development.  
- Use TypeORM migrations to update the database schema.  

