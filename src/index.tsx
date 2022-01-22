import { Routes, Route, Link, HashRouter, useNavigate } from "react-router-dom";
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import React from 'react';
import ReactDOM from 'react-dom';
import { Check } from 'react-bootstrap-icons';

interface IGoalData {
  goalStart: number;
  goalIncrease: number;
  startDay: number;
}

function readGoal(): IGoalData | undefined {
  try {
    return JSON.parse(localStorage.getItem('goal')) || undefined;
  } catch {
    return undefined;
  }
}

const referenceDay = new Date(2000, 0, 0);
const oneDay = 1000 * 60 * 60 * 24;
const dayNumber = (timeInMilli: number): number => {
  const diff = timeInMilli - Number(referenceDay);
  return Math.floor(diff / oneDay);
}

function setGoalData(goalData: Omit<IGoalData, 'startDay'>) {
  const startDay = dayNumber(+new Date());
  localStorage.setItem('goal', JSON.stringify({ ...goalData, startDay: startDay }));
}

function recordPushups(numberOfPushups): void {
  addToLogData({date: +new Date(), numberOfPushups});
}

function readLogData(): ILogData[] {
  try {
    return JSON.parse(localStorage.getItem('logData')) || [];
  } catch {
    return [];
  }
}

function addToLogData(newLogData: ILogData) {
  const logData = readLogData();
  logData.push(newLogData);
  localStorage.setItem('logData', JSON.stringify(logData));
}

interface ILogData {
  date: number,
  numberOfPushups
}

function getTodayCount() {
  const logs = readLogData();
  const today = dayNumber(+new Date());
  const pushupsDone = logs
    .filter((log) => today == dayNumber(log.date))
    .reduce((previousValue: number, currentValue) => { return previousValue + currentValue.numberOfPushups }, 0);
  return pushupsDone;
}

function getTodayGoal() {
  const goal = readGoal();
  const today = dayNumber(+new Date());
  const dayDiff =  today - goal.startDay;
  const todaysGoal = goal.goalStart + goal.goalIncrease * dayDiff;
  return todaysGoal;
}

function TodayInfo() {
  const count = getTodayCount();
  const goal = getTodayGoal();
  if (count === goal) {
    return (
      <Alert variant={'success'}>
        You reached your goal of {goal} pushups today!
      </Alert>
    );
  } else if (count > goal) {
    return (
      <Alert variant={'success'}>
        You smashed your goal of {goal} by doing {count - goal} extra pushups today!
      </Alert>
    );
  } else if (count < goal) {
    return (
      <Alert variant={'info'}>
        {goal - count} more pushups to go today!
      </Alert>
    );
  }
}

function GoalRenderer() {
  return (
    <React.Fragment>
      <h1>Record Some Push Ups</h1>
      <TodayInfo />
      {/* <p>
        <Link to="/record"><Button variant="primary" size="lg">Record in Countdown Mode</Button></Link>
      </p> */}
      <p>
        <Link to="/record"><Button variant="primary" size="lg">Free Record (increasing counter)</Button></Link>
      </p>
    </React.Fragment>
  );
}

interface ICreateGoalProps {
  onSetGoal: () => void;
}

function CreateGoal(props: ICreateGoalProps) {
  const goalStartRef = React.useRef<HTMLInputElement>();
  const goalIncreaseRef = React.useRef<HTMLInputElement>();
  const onSetGoal = () => {
    setGoalData({
      goalStart: Number(goalStartRef.current && goalStartRef.current.value),
      goalIncrease: Number(goalIncreaseRef.current && goalIncreaseRef.current.value)
    });
    props.onSetGoal();
  }

  return (
    <React.Fragment>
      <h1>Welcome, let's set your goal!</h1>
      <Form>
        <Form.Group className="mb-3" controlId="goalStart">
          <Form.Label>How many pushups would you like to start with?</Form.Label>
          <Form.Control type="number" defaultValue="10" ref={goalStartRef} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="goalIncrease">
          <Form.Label>How much should this goal increase by each day?</Form.Label>
          <Form.Control type="number" defaultValue="1" ref={goalIncreaseRef} />
        </Form.Group>
        <Button variant="primary" size='lg' type="submit" onClick={onSetGoal}>
          Let's Go!
        </Button>
      </Form>
    </React.Fragment>
  );
}

const Home = function() {
  const [goal, setGoal] = React.useState(readGoal());

  return (
    <div>
      { goal ? <GoalRenderer /> : <CreateGoal onSetGoal={() => setGoal(readGoal())} />}
      {/* <h1>Record Some Push Ups</h1> */}
      {/* <Link to="/record"><Button variant="primary" size="lg">Record</Button></Link> */}
    </div>
  );
}

const DEBOUNCE_TIMEOUT = 300;
const Record = function() {
  const [count, setCount] = React.useState(0);
  const [touching, setTouching] = React.useState(false);
  const [ignore, setIgnore] = React.useState(false);
  const navigate = useNavigate();
  const save = React.useCallback(() => {
    recordPushups(count);
    navigate('/');
  }, [count]);

  return (
    <React.Fragment>
      <div
        className={'clickSurface ' + (touching ? 'touching': '')}
        onTouchStart={() => {
          if (ignore) {
            return;
          }
          setTouching(true)
        }}
        onTouchEnd={() => {
          if (ignore) {
            return;
          }
          setTouching(false);
          setCount(count => count + 1);
          setIgnore(true);
          setTimeout(() => setIgnore(false), DEBOUNCE_TIMEOUT);
        }}
      >
        <div className='counter display-1'>{ count }</div>
      </div>
      <Button className='saveBtn' variant='success' size='sm' onClick={save}><Check size={48} /></Button>
    </React.Fragment>
  )
}

const About = function() {
  return (
    <h1>About</h1>
  );
}

const App = function() {
  return (
    <React.Fragment>
      <Navbar bg="primary" variant="dark">
        <Container>
          <Navbar.Brand href="#home">
            Mono Pushups
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">About</Link>
          </Nav>
        </Container>
      </Navbar>
      <div className='container mainContent'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/record" element={<Record />} />
          <Route path="about" element={<About />} />
        </Routes>
      </div>
    </React.Fragment>
  );
}

ReactDOM.render(
  <HashRouter>
    <App />
  </HashRouter>,
  document.getElementById('root')
);