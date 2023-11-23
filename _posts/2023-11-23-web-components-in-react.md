---
title: Web Components in React
categories: [Programming,Web,React,Programming,Web,Programming,Web,React]
tags: [Programming,Web,React,Programming,Web,Programming,Web,React]
---

[https://www.notion.so/Web-Components-in-React-1a3a5024656443fd8d45c844e44b0db4](https://www.notion.so/Web-Components-in-React-1a3a5024656443fd8d45c844e44b0db4)


## Events of Web Components in React


An improvement would be to extract the event listener [callback function](https://www.robinwieruch.de/javascript-callback-function/) in order to remove the listener when the component unmounts.


```javascript
import React from 'react';

import 'road-dropdown';

const Dropdown = ({ label, option, options, onChange }) => {
  const ref = React.useRef();

  React.useLayoutEffect(() => {
    const handleChange = customEvent => onChange(customEvent.detail);

    const { current } = ref;

    current.addEventListener('onChange', handleChange);

    // returning the callback in order to remove the listener when the component unmounts.
    return () => current.removeEventListener('onChange', handleChange);
  }, [ref]);

  return (
    <road-dropdown
      ref={ref}
      label={label}
      option={option}
      options={JSON.stringify(options)}
    />
  );
};
That's it for adding an event listener for
```


## React to Web Components


Below works with the `useCustomElement` React Hook which can be installed via `npm install use-custom-element`:


```javascript
import React from 'react';

import 'road-dropdown';

import useCustomElement from 'use-custom-element';

const Dropdown = props => {
  const [customElementProps, ref] = useCustomElement(props);

  return <road-dropdown {...customElementProps} ref={ref} />;
};
```

