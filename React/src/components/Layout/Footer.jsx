import { useFetch } from '../../hooks/useFetch.js';
import SocialLinks from '../SocialLinks.jsx';

function Footer() {
  const { data } = useFetch('/profile');

  return (
    <footer className="footer">
      <p className="footer__title">© 2026 rbielsam</p>
      <SocialLinks profile={data} variant="footer" />
    </footer>
  )
}

export default Footer
