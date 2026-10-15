import Header from './Header.jsx'
import Footer from './Footer.jsx'

function Layout({ nav, children }) {
  return (
    <div className="layout">
      <Header />
      {nav}
      <main className="layout__content">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
