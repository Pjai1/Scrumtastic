# Scrumtastic #

This is the dissertation Repo of Jonas Van Eeckhout. Scrumtastic is a Project Management Tool for Agile Development SCRUM.

Pull the entire Repo to host the project.

# Back-End Installation: #
1. Go into the laravel folder and execute $ composer install (make sure you have Composer)
2. Setup the environment file to connect your database to Laravel
3. php artisan migrate --seed to migrate and seed the DB
4. Setup passport with php artisan passport:clients --password
5. $ php artisan serve and you'll have the API @ localhost:8000

# Front-End Installation: #
1. Go into the scrumtastic folder and execute $ npm i (install latest Node version)
2. $ npm start and you'll have your frontend run @ localhost:3000
3. Make sure to change CLIENT_ID and CLIENT_SECRET in ./constants.js for Token Authentication
