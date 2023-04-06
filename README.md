# smoothScrollTo() Function Concept

## What is it

I'm implementing my own vanilla JS alternative to the browser's `scroll-behavior: smooth` feature here. It's useful for cases when you need to combine this functionality with complex scroll JS behavior.

## Event Listener

First, we need to grab the navigation element to add an event listener to it. We should not apply listeners directly to links in the navigation, as it's a bad practice (refer to the event delegation JS pattern)

```js
// I prefer to store all the DOM selector strings into a single object
const DOM = {
  nav: "navigation",
  navLink: "navigation__link",
};

const navigation = document.querySelector(`.${DOM.nav}`);
```
Next, we add an event listener to the navigation and prevent the default behavior of clicked link targets within it:

``` js
// we can't be sure that navigation element exists, so we need optional chaining
navigation?.addEventListener("click", (e) => {
  e.preventDefault();

});
```

Here, we implement the event delegation pattern: we check if the element is a navigation link or if it is a descendant of one. If it's not, we exit the function and do nothing

```js
navigation?.addEventListener("click", (e) => {
  e.preventDefault();

  const currentTarget = e.target;

  // we interested in a link we actually click
  const currentLink = currentTarget.closest(`.${DOM.navLink}`);
  
  // all the magic will be here on link click
});
```

## Get scrollTo target

The purpose of the smoothScrollTo() function is to scroll to a specific element on the page. Therefore, we need to determine the target of our scroll somehow. Let's create a function that will do this

```js
function getScrollTargetElem() {}
```

What should it do:

* get the link we've clicked;
* obtain the value of the href attribute, which can be the actual ID of the element we want to scroll to or can be an external link or simply a plain text;
* verify if it's a valid value to grab the element by:
  * if not, return null (clearly, we have no element);
  * if yes, grab the target element and return it;

### Get the clicked link

We captured a link we've clicked here:

```js
const currentLink = currentTarget.closest(`.${DOM.navLink}`);
```

We can't truly guarantee that JavaScript will 100% find this element in the DOM. That's why `currentLink` can be either `Element` or `null`.

So, we can pass it as an argument when `getScrollTargetElem` is called inside the event handler. Now, let's set it as a function parameter:

```js
function getScrollTargetElem(clickedLinkElem) {
  if (!clickedLinkElem) {
    return null;
  }
  
  ...
}
```

### Obtain and validate link `href` value

The simplest part is grabbing the link's `href` value (and if there isn't any, we can't proceed further):

```js
function getScrollTargetElem(clickedLinkElem) {
  if (!clickedLinkElem) {
    return null;
  }

  const clickedLinkElemHref = clickedLinkElem.getAttribute("href");

  // The href attribute may be left undefined or empty by the user
  if (!clickedLinkElemHref) {
    return null;
  }
  
  const scrollTarget = document.querySelector(clickedLinkElemHref);
}
```
The desired result is a scroll target element ID, like `#section1`. We should use it to find the target element itself. But what if the `href` contains a link to an external resource or some other invalid value? Let's check what happens if we pass not an element ID, but an external resource link:

```html
 <nav class="navigation">
   ...
   <a class="navigation__link" href="https://www.youtube.com/" target="_blank">Section 3</a>
</nav>
```

... an Error is thrown at us:

<img width="459" alt="Снимок экрана 2023-04-04 224856" src="https://user-images.githubusercontent.com/52240221/229903871-64d07466-1530-47d3-a439-fadc2c5086cf.png">

So, we need to validate the `clickedLinkElemHref` value somehow before passing it to `querySelector()`.

There are 2 ways:

* implement some kind of RegEx to check if the value is valid;
* we can use a `try/catch`-block to handle the thrown `Error` case if the value is invalid;

I've preferred the 2nd way, it's simplier than any RegEx solution:

```js
function getScrollTargetElem(clickedLinkElem) {
  // ... previous stuff
  
  let scrollTarget;
  
  try {
    scrollTarget = document.querySelector(clickedLinkElemHref);
  } catch (e) {
    console.log(e);
    return null;
  }

  return scrollTarget;
}
```

### Get actual scrollTo target

Let's get the element (or `null`) in the event handler:

```js
navigation?.addEventListener("click", (e) => {
  // ... previous stuff

  const currentLink = currentTarget.closest(`.${DOM.navLink}`);

  const scrollTargetElem = getScrollTargetElem(currentLink);

  smoothScrollTo(scrollTargetElem);
});
```
## smoothScrollTo() function and it's basic variables

The actual function that performs all the magic is a function that smoothly scrolls to the target. We call it in the event handler after target definition, as it should know the point to which it should actually scroll

```js
navigation?.addEventListener("click", (e) => {
  // ... previous stuff

  // getScrollTargetElem() returns either an Element or null, 
  // and we handle what to do in both cases within the smoothScrollTo() function
  const scrollTargetElem = getScrollTargetElem(currentLink);

  smoothScrollTo(scrollTargetElem);
});

function smoothScrollTo(scrollTargetElem) {
  if (!scrollTarget) {
    return;
  }
}
```

### Scroll Duration

The crucial thing we need to know is how long our animation should last. In our case, the user should be able to set it directly as a ` smoothScrollTo` parameter. Additionally, we will define a default value in case the user doesn't want to set any.

```js
const DEFAULT_SCROLL_ANIMATION_TIME = 500;

navigation?.addEventListener("click", (e) => {
  // ... previous stuff

  // the user can set any time in milliseconds here
  // I've also packed the arguments into objects for more convenient handling
  smoothScrollTo({scrollTargetElem, scrollDuration: some_time_in_ms});
});

function smoothScrollTo({
  scrollTargetElem,
  scrollDuration = DEFAULT_SCROLL_ANIMATION_TIME
}) {}
```

### Get actual user Y-coordinate

A crucial part of each custom scrolling is detecting the starting point. We can perform further calculations based on the coordinates of our current position on the page. In our case (vertical scrolling), we're interested in Y-coordinates only. The starting point is easy to obtain with `window.scrollY`:

```js
function smoothScrollTo({
  scrollTargetElem,
  scrollDuration = DEFAULT_SCROLL_ANIMATION_TIME
}) {
  if (!scrollTargetElem) {
    return;
  }

  const scrollStartPositionY = Math.round(window.scrollY);
}
```
[Untitled_ Apr 5, 2023 4_03 PM.webm](https://user-images.githubusercontent.com/52240221/230088691-7c632ad0-5dac-484b-8308-bb43ec1a0a1b.webm)

### Get Y-coordinate of target element

We know the starting point of scrolling, and we need one more point - the Y-coordinate of where to scroll. It's a bit more tricky: we have no methods to directly grab the absolute coordinate of the top-left corner of the target element. However, it's still possible, but we need two steps to obtain it.

#### Get the target element Y-coordinate relative to viewport

We need to grab the target element's Y-coordinate relative to the user's viewport. Our helper for this task is the `getBoundingClientRect()` method. Check this [img from MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)

<img width="459" alt="getBoundingClientRect schema" src="https://user-images.githubusercontent.com/52240221/230092703-4b91ad4f-2a24-4a99-bcca-3fa4c8490d38.png">

```js
function smoothScrollTo({
  scrollTargetElem,
  scrollDuration = DEFAULT_SCROLL_ANIMATION_TIME
}) {
  // ... previous stuff
  
  const scrollStartPositionY = Math.round(window.scrollY);
  
  const targetPositionYRelativeToViewport = Math.round(
    scrollTargetElem.getBoundingClientRect().top
  );
}
```

<img width="832" alt="Снимок экрана 2023-04-06 001122" src="https://user-images.githubusercontent.com/52240221/230212586-7bb7369f-45f1-49b5-9fa6-9266729970a5.png">

#### Calc absolute target element Y-coordinate

The absolute target element Y-coordinate can be calc based on the start scroll position and the relative coordinate. The formula is:

```js
targetPositionYRelativeToViewport + scrollStartPositionY;
```

Check the schemes below.

##### Case #1

<img width="1048" alt="Снимок экрана 2023-04-06 003133" src="https://user-images.githubusercontent.com/52240221/230216458-a51587a3-70f8-4955-8a41-2caaca9d3b58.png">

##### Case #2

<img width="1148" alt="Снимок экрана 2023-04-06 003707" src="https://user-images.githubusercontent.com/52240221/230217606-ad0f60f9-a418-4f1a-9da4-c01d53f0cc85.png">

##### Case #3

<img width="1147" alt="Снимок экрана 2023-04-06 004127" src="https://user-images.githubusercontent.com/52240221/230218478-cf973bf2-d066-475c-ba67-03447e0fc689.png">

So now `smoothScrollTo()` function looks like that:

```js
function smoothScrollTo({
  scrollTargetElem,
  scrollDuration = DEFAULT_SCROLL_ANIMATION_TIME
}) {
  // ... previous stuff
  
  const scrollStartPositionY = Math.round(window.scrollY);
  
  const targetPositionYRelativeToViewport = Math.round(
    scrollTargetElem.getBoundingClientRect().top
  );
  
  const targetPositionY = targetPositionYRelativeToViewport + scrollStartPositionY;
}
```

### Get the scroll start timestamp

We need this value for animation settings which would be discussed later. 

There are 2 options to get a 'now'-timestamp:
* `Date.now()`
* `performance.now()`

Both of them return a timestamp, but `performance.now()` is a highly-resolution one, much more precise. So we should use this one to make the animation smooth and precise too.

```js
function smoothScrollTo({
  scrollTargetElem,
  scrollDuration = DEFAULT_SCROLL_ANIMATION_TIME
}) {
  // ... previous stuff
  
  const startScrollTime = performance.now();
}
```

## Animation per frame function

Essentially, each animation is an event that occurs over a duration, and we can break down this time-based event into separate frames. Something like this

![hand-drawn-animation-frames-element-collection_23-2149845068](https://user-images.githubusercontent.com/52240221/230394813-c214930d-7ae1-4fae-aaa1-7c87c2d1dc3b.jpg)

So, we need a function that handles single frame motion, and based on it, we will build the entire animation

Let's define it, call it in the `smoothScrollTo()` as a draft, and pass `startScrollTime` and `scrollDuration` to it:

```js
function smoothScrollTo({
  scrollTargetElem,
  scrollDuration = DEFAULT_SCROLL_ANIMATION_TIME
}) {
  // ... previous stuff
  
  const startScrollTime = performance.now();
  
  animateSingleScrollFrame({
    startScrollTime,
    scrollDuration
  })
}

function animateSingleScrollFrame({startScrollTime, scrollDuration }) {}
```

### Current Time Mock

For each frame, we want to check how much time has already been spent on the animation. We have a `startScrollTime` value and now need to know the current time to calculate the elapsed time

Technically, we would obtain a `currentTime` timestamp from `requestAnimationFrame()`, but we haven't implemented it yet. We will do so later. For now, we'll mock this value:

```js
function animateSingleScrollFrame({startScrollTime, scrollDuration }) {
  // The '100' here is a magic number, used for mock purposes only, 
  // and will be removed upon the implementation of requestAnimationFrame()
  const currentTime = performance.now() + 100;
}
```

### Elapsed Time

The elapsed time will be used to calculate the animation progress. When we implement `requestAnimationFrame()`, `currentTime` (and therefore, `elapsedTime`) will be updated on each Event Loop tick.

```js
function animateSingleScrollFrame({startScrollTime, scrollDuration }) {
  // ... previous stuff
  
  // It's currently equal to 100ms due to the mock value
  const elapsedTime = currentTime - startScrollTime;
}
```

### Animation Progress

The animation progress, which we calculate with the help of ёelapsedTimeё, shows how much of the animation is completed. We need an absolute progress ranging from 0 (beginning of the animation) to 1 (end of animation). This will help us calculate the scroll length in pixels per current frame later on

It will be updated on each Event Loop tick.

```js
function animateSingleScrollFrame({startScrollTime, scrollDuration }) {
  // ... previous stuff
  
  // If the progress exceeds 100% due to some browser lag, we'll stop at 1 and avoid errors here
  const absoluteAnimationProgress = Math.min(elapsedTime / scrollDuration, 1);
}
```
