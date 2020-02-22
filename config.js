const Pool = require('pg').Pool
const pool = new Pool({
  user: 'root',
  host: 'localhost',
  database: 'davetiyem_db',
  password: '',
  port: 5432,
})

const getUsers = (request, response) => {
  pool.query('SELECT * FROM users ORDER BY userid ASC', (error, results) => {
    if (error) {
      throw error
    }
    const deneme= results.rows;
    console.log(deneme.map(item=> item.userid))
    
  })
}


module.exports = {
  getUsers,
}
