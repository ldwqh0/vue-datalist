const Components = require('../components.json')

const externals = {}
Object.keys(Components).forEach(key => {
  externals[`@/lib/${key}`] = `vue-datalist/lib/${key}`
})

exports.externals = externals
