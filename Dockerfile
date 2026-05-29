FROM nginx:alpine

# Copy static assets to Nginx default public directory
COPY index.html style.css app.js /usr/share/nginx/html/

# Expose port 80 (default for Nginx)
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
