import {Container, Nav, Navbar, NavDropdown} from "react-bootstrap";

import {NavbarConfig, NavbarItem} from "../../types.ts";
import {useLocalStorage} from "usehooks-ts";
import {LocalStorage} from "../../config/keys.ts";

export default function SiteNavbar(props: { config: NavbarConfig }) {
  const {config} = props;
  const [theme, setTheme] = useLocalStorage(LocalStorage.site.theme, 'dark');

  function toggleDarkMode() {
    if (theme === 'dark')
      setTheme('light');
    else
      setTheme('dark');
  }

  function buildNavDropdown(navItem: NavbarItem, key: string) {
    return <NavDropdown title={navItem.label} key={key}>
      {navItem.children!.map((child, i) => {
        const childKey = `${key}-${i}`;
        if (child.children && child.children.length > 0)
          return buildNavDropdown(child, childKey);

        if (child.label === '---')
          return <NavDropdown.Divider key={childKey}/>;

        return <NavDropdown.Item href={child.url} key={childKey}>{child.label}</NavDropdown.Item>

      })}
    </NavDropdown>
  }

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#/">{config.siteName}</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">

            {config.items.map((navItem, i) => {

              if (navItem.children && navItem.children.length > 0) {
                return buildNavDropdown(navItem, `nav-dropdown-${i}`);
              }

              return <Nav.Link href={navItem.url} key={`nav-item-${i}`}>{navItem.label}</Nav.Link>
            })}

          </Nav>
          <Nav className="d-flex">
            <Nav.Link onClick={() => toggleDarkMode()}>

              {theme === 'dark'
                ? <span className="material-symbols-outlined">dark_mode</span>
                : <span className="material-symbols-outlined">light_mode</span>}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
