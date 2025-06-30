---
title: Step by Step to Guide (driver.js)
categories: [Frontend,Libraries]
tags: [Frontend,Libraries]
---

[https://www.notion.so/Step-by-Step-to-Guide-driver-js-ce20d85e86db4bceb2200cf886cd3b33](https://www.notion.so/Step-by-Step-to-Guide-driver-js-ce20d85e86db4bceb2200cf886cd3b33)


[bookmark](https://github.com/kamranahmedse/driver.js)


```javascript
import Driver from 'driver.js';
import 'driver.js/dist/driver.min.css';

const driver = new Driver({
  className: 'scoped-class',        
  animate: true,                    
  opacity: 0.75,                   
  padding: 10,                     
  allowClose: true,                
  overlayClickNext: false,          
  doneBtnText: 'Done',              
  closeBtnText: 'Close',           
  stageBackground: '#ffffff',     
  nextBtnText: 'Next',             
  prevBtnText: 'Previous',          
  showButtons: false,              
  keyboardControl: true,            
  scrollIntoViewOptions: {},        
  onHighlightStarted: (Element) => {}, 
  onHighlighted: (Element) => {},      
  onDeselected: (Element) => {},       
  onReset: (Element) => {},            
  onNext: (Element) => {},                    
  onPrevious: (Element) => {},               
});

driver.defineSteps([
  {
    element: '#first-element-introduction',
    popover: {
      className: 'first-step-popover-class',
      title: 'Title on Popover',
      description: 'Body of the popover',
      position: 'left'
    }
  },
  {
    element: '#second-element-introduction',
    popover: {
      title: 'Title on Popover',
      description: 'Body of the popover',
      position: 'top'
    }
  },
  {
    element: '#third-element-introduction',
    popover: {
      title: 'Title on Popover',
      description: 'Body of the popover',
      position: 'right'
    }
  },
]);

driver.start();
```


Just highlight some elements like below.


```javascript
const driver = new Driver();
driver.highlight({
  element: '#some-element',
  popover: {
    title: 'Title for the Popover',
    description: 'Description for it',
    position: 'left',
    offset: 20,
  }
});
```

