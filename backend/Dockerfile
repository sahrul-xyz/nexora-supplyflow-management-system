FROM php:8.3-cli-alpine

# Install system dependencies & PHP extensions needed by Laravel 13
RUN apk add --no-cache bash curl libpng-dev libxml2-dev zip unzip git oniguruma-dev libzip-dev ca-certificates \
    && update-ca-certificates \
    && docker-php-ext-install pdo_mysql bcmath mbstring pcntl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy files
COPY . /var/www

# Install PHP dependencies without dev packages
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Directory permissions for Laravel storage & cache
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

EXPOSE 8000

CMD ["sh", "-c", "php artisan config:clear && php artisan route:clear && php artisan migrate --force && php artisan db:seed --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]
