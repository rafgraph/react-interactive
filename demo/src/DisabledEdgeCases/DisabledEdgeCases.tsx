import * as React from 'react';
import { Interactive, InteractiveState } from 'react-interactive';
import { Link } from '../Interactive';
import { styled } from '../stitches.config';
import './DisabledEdgeCases.css';

const StyledDisplayStateContainer = styled('div', {
  fontSize: '14px',
  opacity: 0.5,
});

const DisplayState: React.VFC<{
  state: InteractiveState;
  disabled: boolean;
}> = ({ state: { hover, active, focus }, disabled }) => (
  <StyledDisplayStateContainer>
    hover: <code>{`${hover}`}</code>, active: <code>{`${active}`}</code>, focus:{' '}
    <code>{`${focus}`}</code>, disabled: <code>{`${disabled}`}</code>
  </StyledDisplayStateContainer>
);

const ButtonComponent = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<'button'>
>((props, ref) => <button {...props} ref={ref} />);

const LinkComponent = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'>
  // eslint-disable-next-line jsx-a11y/anchor-has-content
>((props, ref) => <a {...props} ref={ref} />);

const DivComponent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'>
>((props, ref) => <div {...props} ref={ref} tabIndex={0} />);

const DisabledEdgeCasesContainer = styled('div', {
  padding: '20px',
  margin: '0 auto',
  maxWidth: '600px',
});

const H1 = styled('h1', {
  fontSize: '20px',
  margin: '10px 0',
});

const DemoContainer = styled('div', {
  margin: '20px 0',
});

const initialState: InteractiveState = {
  hover: false,
  active: false,
  focus: false,
};

export const DisabledEdgeCases: React.VFC = () => {
  const [buttonState, setButtonState] = React.useState<InteractiveState>(
    initialState,
  );
  const [buttonDisabled, setButtonDisabled] = React.useState<boolean>(false);

  const [linkState, setLinkState] = React.useState<InteractiveState>(
    initialState,
  );
  const [linkDisabled, setLinkDisabled] = React.useState<boolean>(false);

  const [divState, setDivState] = React.useState<InteractiveState>(
    initialState,
  );
  const [divDisabled, setDivDisabled] = React.useState<boolean>(false);

  const [
    buttonComponentState,
    setButtonComponentState,
  ] = React.useState<InteractiveState>(initialState);
  const [
    buttonComponentDisabled,
    setButtonComponentDisabled,
  ] = React.useState<boolean>(false);

  const [
    linkComponentState,
    setLinkComponentState,
  ] = React.useState<InteractiveState>(initialState);
  const [
    linkComponentDisabled,
    setLinkComponentDisabled,
  ] = React.useState<boolean>(false);

  const [
    divComponentState,
    setDivComponentState,
  ] = React.useState<InteractiveState>(initialState);
  const [
    divComponentDisabled,
    setDivComponentDisabled,
  ] = React.useState<boolean>(false);

  return (
    <DisabledEdgeCasesContainer>
      <H1>Clicking the button/link/div disables it</H1>
      <p>
        Check for edge cases related to{' '}
        <Link href="https://github.com/facebook/react/issues/9142">
          this React bug
        </Link>
        , which is fixed/worked around in React Interactive.
      </p>
      <DemoContainer>
        <Interactive
          as="button"
          disabled={buttonDisabled}
          onClick={() => setButtonDisabled(true)}
          onStateChange={({ state }) => setButtonState(state)}
          className="DisabledEdgeCases-button"
        >
          <code>as="button"</code>
        </Interactive>
        <DisplayState state={buttonState} disabled={buttonDisabled} />
      </DemoContainer>
      <DemoContainer>
        <Interactive
          as="a"
          href="#top"
          disabled={linkDisabled}
          onClick={() => setLinkDisabled(true)}
          onStateChange={({ state }) => setLinkState(state)}
          className="DisabledEdgeCases-link"
        >
          <code>as="a" href="#top"</code>
        </Interactive>
        <DisplayState state={linkState} disabled={linkDisabled} />
      </DemoContainer>
      <DemoContainer>
        <Interactive
          as="div"
          tabIndex={0}
          disabled={divDisabled}
          onClick={() => setDivDisabled(true)}
          onStateChange={({ state }) => setDivState(state)}
          className="DisabledEdgeCases-button"
        >
          <code>as="div" tabIndex=0</code>
        </Interactive>
        <DisplayState state={divState} disabled={divDisabled} />
      </DemoContainer>
      <DemoContainer>
        <Interactive
          as={ButtonComponent}
          disabled={buttonComponentDisabled}
          onClick={() => setButtonComponentDisabled(true)}
          onStateChange={({ state }) => setButtonComponentState(state)}
          className="DisabledEdgeCases-button"
        >
          <code>{'as={ButtonComponent}'}</code>
        </Interactive>
        <DisplayState
          state={buttonComponentState}
          disabled={buttonComponentDisabled}
        />
      </DemoContainer>
      <DemoContainer>
        <Interactive
          as={LinkComponent}
          href="#top"
          disabled={linkComponentDisabled}
          onClick={() => setLinkComponentDisabled(true)}
          onStateChange={({ state }) => setLinkComponentState(state)}
          className="DisabledEdgeCases-link"
        >
          <code>{'as={LinkComponent} href="#top"'}</code>
        </Interactive>
        <DisplayState
          state={linkComponentState}
          disabled={linkComponentDisabled}
        />
      </DemoContainer>
      <DemoContainer>
        <Interactive
          as={DivComponent}
          disabled={divComponentDisabled}
          onClick={() => setDivComponentDisabled(true)}
          onStateChange={({ state }) => setDivComponentState(state)}
          className="DisabledEdgeCases-button"
        >
          <code>{'as={DivComponent}'}</code>
        </Interactive>
        <DisplayState
          state={divComponentState}
          disabled={divComponentDisabled}
        />
      </DemoContainer>
      <Interactive
        as="button"
        onClick={() => {
          setButtonDisabled(true);
          setLinkDisabled(true);
          setDivDisabled(true);
          setButtonComponentDisabled(true);
          setLinkComponentDisabled(true);
          setDivComponentDisabled(true);
        }}
        className="DisabledEdgeCases-button"
      >
        Disable all
      </Interactive>
      <Interactive
        as="button"
        onClick={() => {
          setButtonDisabled(false);
          setLinkDisabled(false);
          setDivDisabled(false);
          setButtonComponentDisabled(false);
          setLinkComponentDisabled(false);
          setDivComponentDisabled(false);
        }}
        className="DisabledEdgeCases-button"
      >
        Un-disable all
      </Interactive>
    </DisabledEdgeCasesContainer>
  );
};
