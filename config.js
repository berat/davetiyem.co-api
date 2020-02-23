module.exports = {
  jwtSecret : 'herseycokgizli',
  local: {
    db : {
      user: 'root',
      host: 'localhost',
      database: 'davetiyem_db',
      password: '',
      port: 5432,
    },
    folders: {
      uploadFolder: '../uploads/users',
      baseUSer: '../users',
      zipFiles: '../dfiles.zip',
    }
  },
  live: {

  }
}