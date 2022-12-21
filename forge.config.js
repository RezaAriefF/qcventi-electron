module.exports = {
  packagerConfig: {
    icon: 'build/iconqc', // no file extension required

  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        // An URL to an ICO file to use as the application icon (displayed in Control Panel > Programs and Features).
        icon: 'build/iconqc.ico',
        // The ICO file to use as the icon for the generated Setup.exe
        setupIcon: 'build/iconqc.ico',

        DisplayIcon: 'build/iconqc.ico',
        

      },
      
    },
    {
      name: '@electron-forge/maker-zip',
      config: {
        // An URL to an ICO file to use as the application icon (displayed in Control Panel > Programs and Features).
        icon: 'build/iconqc.ico',
        // The ICO file to use as the icon for the generated Setup.exe
        setupIcon: 'build/iconqc.ico',

        iconUrl: 'build/iconqc.ico',

        DisplayIcon: 'build/iconqc.ico',

      },
      
    },
    {
      name: '@electron-forge/maker-deb',
      
    },
    {
      name: '@electron-forge/maker-rpm',
      
    },
  ],
};
