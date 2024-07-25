import {JSX, PropsWithChildren} from "react";
import {Container} from "react-bootstrap";

import SiteNavbar from "./parts/SiteNavbar";
import navbarConfig from "../config/navbar";

export default function BasePage(props: PropsWithChildren<{
  title: string;
}>): JSX.Element {

  return (
    <>
      <SiteNavbar config={navbarConfig}/>

      <Container fluid className="mb-3 bg-light-subtle">

        <Container className="pt-3 pb-2">
          <h1 className="display-6">{props.title}</h1>
        </Container>

      </Container>
      {/*<main className="main">*/}
      <main>
        <Container>
          {props.children}
        </Container>
      </main>

    </>
  );
}
