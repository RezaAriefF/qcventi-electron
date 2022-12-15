module.exports = {
  packagerConfig: {
    icon: 'build/icon',
    installerIcon: "build/icon",
    uninstallerIcon: "build/icon",
    uninstallDisplayName: "QCVenti-Uninstaller 1.00",
    oneClick: false,
    allowToChangeInstallationDirectory: true
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      
    },
    {
      name: '@electron-forge/maker-zip',
      
    },
    {
      name: '@electron-forge/maker-deb',
      
    },
    {
      name: '@electron-forge/maker-rpm',
      
    },
  ],
};
