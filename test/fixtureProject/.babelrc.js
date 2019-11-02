const path = require('path')

module.exports = {
  "env": {
    "artifactDirectoryTest": {
      "plugins": [
        ["relay", {
          "artifactDirectory": path.resolve(__dirname, "src", "__generated__")
        }]
      ],
    }
  },
  "plugins": ["relay"],
  "presets": [
    "@babel/preset-react",
    "@babel/preset-env"
  ]
}
