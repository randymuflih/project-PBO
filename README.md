# Sistem Informasi Magang

> Web-based information system for managing student internship data, built with Laravel and MySQL.

## About This Project

Sistem Informasi Magang adalah platform berbasis web untuk mengelola data magang mahasiswa, dirancang untuk memudahkan proses pendataan, monitoring, dan pelaporan kegiatan magang secara terstruktur.

## My Role

> **Note:** This repository is a fork from the team's collaborative repository. I am one of the primary contributors.

In this project, I served as **Fullstack Developer & Team Lead**, taking end-to-end responsibility across:

- 🗄️ **Database Design** — Designed the relational schema in MySQL, including tables for students, supervisors, internship records, and reporting workflows
- ⚙️ **Backend Development** — Built REST API and core business logic using Laravel, including authentication, role-based access control, and CRUD operations
- 🎨 **Frontend Development** — Implemented user interfaces using Laravel Blade templates, ensuring responsive and intuitive UX for both students and administrators
- 👥 **Project Coordination** — Led team workflow, distributed tasks, reviewed pull requests, and ensured the project stayed on track to meet deadlines

## Tech Stack

- **Backend:** Laravel 10, PHP 8.x
- **Database:** MySQL 8.0
- **Frontend:** Blade Templating, HTML, CSS, JavaScript
- **Version Control:** Git, GitHub

## Key Features

- 📝 Student internship registration and management
- 👨‍🏫 Supervisor assignment and monitoring
- 📊 Activity logging and report generation
- 🔐 Role-based access (Student, Supervisor, Admin)
- 📅 Internship timeline tracking

## Getting Started

### Prerequisites
- PHP 8.x
- Composer
- MySQL 8.0
- Node.js (for asset compilation)

### Installation
```bash
# Clone the repository
git clone https://github.com/randymuflih/<repo-name>.git
cd <repo-name>

# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Configure database in .env, then migrate
php artisan migrate --seed

# Run the application
php artisan serve
```

## Screenshots

<!-- Tambahkan screenshot UI di sini -->
*[Add UI screenshots here — dashboard, registration form, monitoring view, etc.]*

## Contact

**Muhammad Randy Muflih**  
📧 randymuflih@gmail.com  
🌐 [portofolio-randymuflih.vercel.app](https://portofolio-randymuflih.vercel.app/)
