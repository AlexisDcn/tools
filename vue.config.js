module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/'  // Utilisez '/' pour un domaine personnalisé
    : '/',
  
  // Configuration pour Single Page Application
  outputDir: 'dist'
}