module.exports = {
  local: {
    db: {
      user: 'root',
      host: 'localhost',
      database: 'davetiyem_db',
      password: 'xxxxxxxx',
      port: 5432
    },
    folders: {
      uploadFolder: '../public/uploads/users',
      baseUSer: '../users',
      zipFiles: '../dfiles.zip'
    }
  },
  live: {},
  jwtSecret: 'xxxxxxxx',
  mail: {
    host: 'smtp.yandex.com',
    port: 465,
    secure: true,
    auth: {
      user: 'destek@davetiyem.co',
      pass: 'xxxxxxxxxx'
    }
  },
  version: '/v1/auth/'
}