# 📦 Backend Asset Management - PT. Media Antar Nusa

Backend service for the **Asset Management System** at PT. Media Antar Nusa, built with **NestJS**, **MySQL**.

---

## 🚀 Tech Stack
- [NestJS](https://nestjs.com/) - Node.js framework for scalable server-side apps  
- [MySQL](https://www.mysql.com/) - Relational Database  
- [TypeORM](https://typeorm.io/) - ORM for database management  
- [Docker](https://www.docker.com/) - Containerization  

---

---

## ⚙️ Setup & Installation

### 1️⃣ Clone Repository
```bash
git clone https://github.com/fajar-dev/be-asset-management-nusanet.git
cd asset-management-backend
```

### 2️⃣ Environment Variables
Create a `.env` file in the project root:

```env
# Database
DATABASE_HOST=mysql
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=asset_management

# App
APP_PORT=3000
```

### 3️⃣ Run with Docker
```bash
docker-compose up --build
```

### 4️⃣ Run without Docker (optional)
```bash
npm install
npm run start:dev
```

---

## 🗂️ Database ERD

Here is the **Entity Relationship Diagram (ERD)** for the Asset Management System:

![ERD](docs/erd.png)


---

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
- Run `docker-compose up` before starting development.  
- Use TypeORM migrations to update the database schema.  

---

## 🏢 PT. Media Antar Nusa
This backend was developed to support the internal **Asset Management System** of PT. **Media Antar Nusa**.
