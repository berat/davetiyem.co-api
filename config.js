module.exports = {
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

  },
  jwtSecret : 'herseycokgizli',
  mail: {
    host: 'smtp.yandex.com',
    port: 465,
    secure: true,
    auth: {
       user: 'destek@davetiyem.co',
       pass: 'B2bo4-B2bo4'
    }
  },
  version: '/v1/auth/'
}