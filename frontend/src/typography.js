import Typography from 'typography';
import Wordpress2016 from 'typography-theme-wordpress-2016';

Wordpress2016.overrideThemeStyles = () => ({
  'a.gatsby-resp-image-link': {
    boxShadow: 'none',
  },
});

delete Wordpress2016.googleFonts;

const typography = new Typography(Wordpress2016);

typography.injectStyles();

export const { rhythm, scale } = typography;
