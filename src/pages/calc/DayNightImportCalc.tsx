import {JSX, useEffect, useState} from "react";
import BasePage from "../BasePage.tsx";
import {Accordion, Button, Card, CardGroup, Col, Form, InputGroup, Row} from "react-bootstrap";
import {useLocalStorage} from "usehooks-ts";

type LoadItem = {
  label: string;
  power: number;
  enabled: boolean;
}
type FormData = {
  importPriceDay: number;
  importPriceNight: number;
  exportPriceDay: number;
  // exportPriceNight: number;
  pvPower: number;
  shiftableImportLoads: LoadItem[];
  baseLoad: number;
}

type CalculationResult = {
  dayLoad: number;
  dayNetImport: number;
  dayCost: number;
  nightLoad: number;
  nightCost: number;
  netCost: number;
}

export default function DayNightImportCalc(): JSX.Element {

  const [formInputs, setFormInputs] = useLocalStorage<FormData>('day-night-import-calc-inputs', {
    importPriceDay: 12.0,
    importPriceNight: 10.0,
    exportPriceDay: 15.0,
    // exportPriceNight: 15.0,
    pvPower: 4.0,
    shiftableImportLoads: [],
    baseLoad: 0.3,
  });

  const [dayResults, setDayResults] = useState<CalculationResult>();
  const [nightResults, setNightResults] = useState<CalculationResult>();
  const [newShiftableLoadInput, setNewShiftableLoadInput] = useState<LoadItem>({
    power: 0,
    label: '',
    enabled: true,
  });

  function calculate2(dayLoad: number, nightLoad: number, resultSetter: (result: CalculationResult) => void) {
    const dayNetImport = dayLoad - formInputs.pvPower;
    const dayCost = dayNetImport > 0
      ? dayNetImport * formInputs.importPriceDay
      : dayNetImport * formInputs.exportPriceDay;

    const nightCost = (nightLoad * formInputs.importPriceNight);

    const netCost = (dayCost + nightCost);

    const result: CalculationResult = {
      dayLoad,
      dayNetImport,
      nightLoad,
      dayCost: dayCost / 100.0,
      nightCost: nightCost / 100.0,
      netCost: netCost / 100.0
    };
    resultSetter(result);
  }

  function calculate() {
    let dayLoad: number, nightLoad: number;

    const shiftableLoad = formInputs.shiftableImportLoads.reduce((acc, val) => val.enabled ? (acc + val.power) : acc, 0);

    dayLoad = shiftableLoad + formInputs.baseLoad;
    nightLoad = formInputs.baseLoad;
    calculate2(dayLoad, nightLoad, setDayResults);

    dayLoad = formInputs.baseLoad;
    nightLoad = shiftableLoad + formInputs.baseLoad;
    calculate2(dayLoad, nightLoad, setNightResults);
  }

  function addShiftableLoadItem() {
    setFormInputs({
      ...formInputs,
      shiftableImportLoads: [
        ...formInputs.shiftableImportLoads,
        newShiftableLoadInput,
      ],
    });

    setNewShiftableLoadInput({power: 0, label: '', enabled: true});
  }

  function removeShiftableLoadItem(idx: number) {
    const items = [...formInputs.shiftableImportLoads];
    items.splice(idx, 1);

    setFormInputs({
      ...formInputs,
      shiftableImportLoads: items,
    });
  }

  function toggleShiftableLoadItemEnabled(idx: number) {
    const items = [...formInputs.shiftableImportLoads];
    items[idx].enabled = !items[idx].enabled;

    setFormInputs({
      ...formInputs,
      shiftableImportLoads: items,
    });
  }


  useEffect(() => {
    calculate();
  }, [formInputs])

  function ResultCard(props: { title: string, subtitle?: string, results: CalculationResult }): JSX.Element {
    return <Card>
      <Card.Body>
        <Card.Title><h3>{props.title}</h3>
          {props.subtitle && <p className="lead">{props.subtitle}</p>}</Card.Title>
        <dl className="row">
          <dt className="col-lg-4 col-6 text-right">Daytime load</dt>
          <dd className="col-lg-8 col-6 text-left">{props.results.dayLoad.toFixed(1)} kw</dd>

          <dt className="col-lg-4 col-6 text-right">Daytime net import</dt>
          <dd className="col-lg-8 col-6 text-left">{props.results.dayNetImport.toFixed(1)} kw</dd>

          <dt className="col-lg-4 col-6 text-right">Daytime cost</dt>
          <dd className="col-lg-8 col-6 text-left">£{props.results.dayCost.toFixed(2)}/hr</dd>

          <dt className="col-lg-4 col-6 text-right">Night load</dt>
          <dd className="col-lg-8 col-6 text-left">{props.results.nightLoad.toFixed(1)} kw</dd>

          <dt className="col-lg-4 col-6 text-right">Night cost</dt>
          <dd className="col-lg-8 col-6 text-left">£{props.results.nightCost.toFixed(2)}/hr</dd>
        </dl>
      </Card.Body>
      <Card.Footer>
        <dl className="row">
          <dt className="col-sm-4 text-right">Net cost</dt>
          <dd className="col-sm-6 text-left">£{props.results.netCost.toFixed(2)}/hr</dd>
        </dl>
      </Card.Footer>
    </Card>
  }


  return (
    <BasePage title="Day/night import calculator">

      <section title="Description" className="mb-3">
        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header>What is this calculator?</Accordion.Header>
            <Accordion.Body>
              <div>
                <p>Use this form to model what it would cost to import large loads during the day, when solar is high
                  but
                  electricity is cheap, or shift your load to a more expensive period overnight but solar is
                  unavailable</p>
              </div>
              <div>
                <p>This is useful if</p>
                <ol>
                  <li>You are on Octopus Agile (or another time-of-day tariff)</li>
                  <li>You have solar panels and an export tariff</li>
                  <li>There is a cheap period during daylight hours</li>
                  <li>There is a less cheap period during overnight</li>
                </ol>
              </div>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </section>

      <section title="Inputs" className="mb-3">
        <Form>
          <h2>Inputs</h2>

          <Row className="mb-3">
            <Form.Label>Grid import unit price</Form.Label>
            <Form.Group as={Col} className="col-12 col-sm-6">
              <InputGroup>
                <InputGroup.Text>Day</InputGroup.Text>
                <Form.Control type="number"
                              placeholder="Day unit rate"
                              value={formInputs.importPriceDay}
                              step={0.1}
                              onChange={e => setFormInputs({...formInputs, importPriceDay: parseFloat(e.target.value)})}
                />
                <InputGroup.Text>p/kWh</InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Form.Group as={Col} className="col-12 col-sm-6">
              <InputGroup>
                <InputGroup.Text>Night</InputGroup.Text>
                <Form.Control type="number"
                              placeholder="Night unit rate"
                              value={formInputs.importPriceNight}
                              step={0.1}
                              onChange={e => setFormInputs({
                                ...formInputs,
                                importPriceNight: parseFloat(e.target.value)
                              })}
                />
                <InputGroup.Text>p/kWh</InputGroup.Text>
              </InputGroup>
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Label className="mt-2">Grid export unit price</Form.Label>
            <Form.Group as={Col} className="col-md-6">
              <InputGroup>
                <InputGroup.Text>Day</InputGroup.Text>
                <Form.Control type="number"
                              placeholder="Day unit rate"
                              value={formInputs.exportPriceDay}
                              step={0.1}
                              onChange={e => setFormInputs({...formInputs, exportPriceDay: parseFloat(e.target.value)})}
                />
                <InputGroup.Text>p/kWh</InputGroup.Text>
              </InputGroup>
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Label className="mt-2">Power</Form.Label>
            <Form.Group as={Col} className="col-12 col-md-6 col-lg-4">
              <Form.Label>Estimated PV power</Form.Label>
              <InputGroup>
                <InputGroup.Text>PV</InputGroup.Text>
                <Form.Control type="number"
                              placeholder="Estimated PV power"
                              value={formInputs.pvPower}
                              step={0.1}
                              onChange={e => setFormInputs({...formInputs, pvPower: parseFloat(e.target.value)})}
                />
                <InputGroup.Text>kW</InputGroup.Text>
              </InputGroup>
              <Form.Text>This is only ever an estimate, but the calculator will tell you the values <em>if</em> you
                generate this much PV.</Form.Text>
            </Form.Group>

            <Form.Group as={Col} className="col-12 col-md-6 col-lg-4">
              <Form.Label>Shiftable import load</Form.Label>
              {formInputs.shiftableImportLoads.map((item, idx) =>
                <InputGroup key={`load-item-${idx}`}>
                  <Form.Control type="text"
                                placeholder="Name"
                                readOnly={true}
                                value={item.label}
                  />
                  <Form.Control type="text"
                                placeholder="Power"
                                readOnly={true}
                                value={item.power.toFixed(1)}
                  />
                  <InputGroup.Text>kW</InputGroup.Text>
                  <InputGroup.Checkbox checked={item.enabled}
                                       onInput={() => toggleShiftableLoadItemEnabled(idx)}/>
                  <Button variant="outline-secondary"
                          onClick={() => removeShiftableLoadItem(idx)}>
                    X
                  </Button>
                </InputGroup>)}

              <Form.Label>Add new item</Form.Label>
              <InputGroup>
                <InputGroup.Text className="d-none d-sm-flex">Name</InputGroup.Text>
                <Form.Control type="text"
                              placeholder="Name"
                              value={newShiftableLoadInput?.label}
                              onChange={e => setNewShiftableLoadInput({
                                ...newShiftableLoadInput,
                                label: e.target.value
                              })}
                />
                <InputGroup.Text>Power</InputGroup.Text>
                <Form.Control type="number"
                              placeholder="Power"
                              value={newShiftableLoadInput?.power}
                              step={0.1}
                              onChange={e => setNewShiftableLoadInput({
                                ...newShiftableLoadInput,
                                power: parseFloat(e.target.value)
                              })}
                />
                <InputGroup.Text>kW</InputGroup.Text>
                <Button variant="outline-secondary"
                        onClick={() => addShiftableLoadItem()}>
                  Add
                </Button>
              </InputGroup>

              <Form.Text>This is the import load which can be shifted from day to night, if it works out cheaper.
                Examples include charging the house battery, EV, hot water, etc</Form.Text>
            </Form.Group>

            <Form.Group as={Col} className="col-12 col-md-6 col-lg-4">
              <Form.Label>Base load</Form.Label>
              <InputGroup>
                <InputGroup.Text>Base</InputGroup.Text>
                <Form.Control type="number"
                              placeholder="Base load"
                              value={formInputs.baseLoad}
                              step={0.1}
                              onChange={e => setFormInputs({...formInputs, baseLoad: parseFloat(e.target.value)})}
                />
                <InputGroup.Text>kW</InputGroup.Text>
              </InputGroup>
              <Form.Text>This is the base load that your house draws all the time, day and night. You can set this to
                zero if you don't know or it's not relevant.</Form.Text>
            </Form.Group>
          </Row>

        </Form>
      </section>

      <section title="Results" className="mb-3">
        <h2>Results</h2>

        <CardGroup>
          {dayResults && <ResultCard title="Day import"
                                     subtitle="If you import your shiftable load during the daytime"
                                     results={dayResults}/>}
          {nightResults && <ResultCard title="Night import"
                                       subtitle="If you import your shiftable load during the night"
                                       results={nightResults}/>}
        </CardGroup>
      </section>

    </BasePage>
  );
}
