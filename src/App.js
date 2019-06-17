import React from 'react';

import Input from "./components/FormValidator/Input";

function App() {
  return (
    <div className="App">
      <Input id={'id'} name={'name'} max={7} type={'checkbox'} defaultValue={3} title={'title'} rule={'select'} inputOptions={[[1, 2], 3, 4, [5, 6]]} required={true} errorText={'only numbers allowed'} />
    </div>
  );
}

export default App;