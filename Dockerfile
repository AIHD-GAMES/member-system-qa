FROM nginx:alpine

# Copy static assets to Nginx default public directory
COPY index.html faq.html style.css app.js /usr/share/nginx/html/

# Copy default.conf.template for Cloud Run port mapping
COPY default.conf.template /etc/nginx/templates/default.conf.template

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

