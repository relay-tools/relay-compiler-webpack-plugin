import React from 'react';
import {Col, Grid, Row} from "react-bootstrap";
import {Link} from 'react-router-dom';

export default ({people}) => {
  return <Grid fluid>
    <Row>
      <Col xs={12}>
        <h2>Home</h2>
        <ul>
          {people.map(({id, fullName}) =>
            <li key={id}>
              <Link to={`/about/${id}/`}>{fullName}</Link>
            </li>)}
        </ul>
      </Col>
    </Row>
  </Grid>;
};
