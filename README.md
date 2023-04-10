# smoothScrollTo() Function Concept

## Contents:
* [Main idea](#main-idea-table-of-contents) 
* [Prerequisites](#prerequisites-table-of-contents)
* [Basic layout](#basic-layout-table-of-contents)
* [Adding event listener on the navigation](#adding-event-listener-on-the-navigation-table-of-contents)
* [Function `getScrollTargetElem()` get target to which it needs to scroll](#function-getscrolltargetelem-get-target-to-which-it-needs-to-scroll-table-of-contents)
  * [Get the clicked link](#get-the-clicked-link)
  * [Obtain and validate link `href` value](#obtain-and-validate-link-href-value)
* [Function `smoothScrollTo()` and it's basic variables](#function-smoothscrollto-and-its-basic-variables-table-of-contents)
  * [Get the scroll start position](#get-the-scroll-start-position)
  * [Get the scroll end position](#get-the-scroll-end-position)
  * [Get the scroll start timestamp](#get-the-scroll-start-timestamp)
  * [Define animation per frame function](#define-animation-per-frame-function)
* [Function `animateSingleScrollFrame()` gives the progress of the animation](#function-animatesinglescrollframe-gives-the-progress-of-the-animation-table-of-contents)
  * [Calculate animation progress](#calculate-animation-progress)
  * [Calculate scroll length per frame](#calculate-scroll-length-per-frame)
  * [Let's scroll to the new Y-coordinate position!](#lets-scroll-to-the-new-y-coordinate-position!)
  

## Main idea ([Table of Contents](#contents))

I'm implementing my own vanilla JS alternative to the browser's `scroll-behavior: smooth` feature here. It's useful for cases when you need to combine this functionality with complex scroll JS behavior.

You could check a [Full Demo on Codepen](https://codepen.io/nat-davydova/full/QWZwOdb/5db409195086b5b1631055fbcb6c94e5)

## Prerequisites ([Table of Contents](#contents))

For a good understanding of the article, the following are necessary:
* basic layout knowledge: lists, positioning,...
* JavaScript knowledge: DOM, events,...
* your good mood

## Basic layout ([Table of Contents](#contents))

### HTML

The HTML structure here is simple: just a navigation with 3 links and 3 sections corresponding to them.
Yes, the navigation already works by means of the combination of href and id attributes. But the transition is immediate. Our task is to make it smooth.

```html
<body>
  <nav class="navigation">
    <a class="navigation__link" href="#section1">Section 1</a>
    <a class="navigation__link" href="#section2">Section 2</a>
    <a class="navigation__link" href="#section3">Section 3</a>
  </nav>
  <section id="section1">Section 1</section>
  <section id="section2">Section 2</section>
  <section id="section3">Section 3</section>
</body>
```

### CSS

The styles are simple too. I've made the navigation fixed and added some decorative section styles to visually separate them due to the use of alternating background colors.

<details>
<summary>CSS code</summary>

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Arial';
}

nav {
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    gap: 30px;
    width: 100%;
    padding: 20px 0;
    background-color: #fff;
}

nav a {
    color: black;
    text-decoration: none;
    transition: color .2s linear 0s;
}

nav a:hover {
    color: green;
}

section {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
    font-size: 40px;
    color: #fff;
    background-color: black;
}

section:nth-of-type(2n) {
    background-color: gray;
}
```
</details>

## Adding event listener on the navigation ([Table of Contents](#contents))

  First, we need to grab the navigation element to add an event listener to it. We should not apply listeners directly to links in the navigation, as it's a bad practice (refer to the event delegation JS pattern). 
  
  Next, we add an event listener to the navigation and prevent the default behavior of clicked link targets within it to discard immediate transition.
  
  Then we need to calculate the element to which the scroll will be performed. The function `getScrollTargetElem()` do it as is described [below](#function-getscrolltargetelem-get-target-to-which-it-needs-to-scroll-table-of-contents).
  
  In the end, the magic of smooth scrolling will happen. The function `smoothScrollTo()` will be [responsible](#function-smoothscrollto-and-its-basic-variables-table-of-contents) for this.

```js
// I prefer to store all the DOM selector strings 
// into a single object for further reuse
const DOM = {
  nav: "navigation",
  navLink: "navigation__link",
};

const navigation = document.querySelector(`.${DOM.nav}`);

// we can't be sure that navigation element exists,
// so we need optional chaining
navigation?.addEventListener("click", (e) => {
  e.preventDefault();
  
  // - encapsulates many checks for finding the element 
  // to which we need to make a smooth scroll
  // - returns either an Element or null, and we handle what to do 
  // in both cases within the `smoothScrollTo` function 
  const scrollTargetElem = getScrollTargetElem(e.target);

  // all the magic will be here on link click
  smoothScrollTo({
    scrollTargetElem,
    onAnimationEnd: () => console.log("animation ends"),
  });
});
```

## Function `getScrollTargetElem()` get target to which it needs to scroll ([Table of Contents](#contents))

The purpose of the [`smoothScrollTo()`](#function-smoothscrollto-and-its-basic-variables-table-of-contents) function is to scroll to a specific element on the page. Therefore, we need to determine the target of our scroll somehow. Let's create a function `getScrollTargetElem()` that will do this.

What should `getScrollTargetElem()` function do:
* get the link we've clicked
* obtain the value of the href attribute, which can be the actual ID of the element we want to scroll to or can be an external link or simply a plain text
* verify if it's a valid value to grab the element by:
  * if not, return null (clearly, we have no element)
  * if yes, grab the target element and return it

### Get the clicked link

We captured some element on the page we've clicked here. We implement the event delegation pattern. Check if the element is a navigation link or if it is a descendant of one. If it's not, we exit the function. Note that after this and the following unsuccessful checks, we will return `null` as a signal that the `getScrollTargetElem()` function failed to find the target to which the scroll should be performed.

We can't truly guarantee that JavaScript will 100% find this element in the DOM. That's why `clickedLinkElem` can be either `Element` or `null`.

```js
function getScrollTargetElem(clickedTargetElem: EventTarget | null) {
  
  // did you know that event.target may not be a DOM Element?
  if (!(clickedTargetElem instanceof Element)) {
    return null;
  }

  // event delegation pattern
  const clickedLinkElem = clickedTargetElem.closest(`.${DOM.navLink}`);

  if (!clickedLinkElem) {
    return null;
  }
  
  // ...
}
```

### Obtain and validate link `href` value

The next part is grabbing the link's `href` value (and if there isn't any, we can't proceed further).

The desired result is a scroll target element ID, like `#section1`. We should use it to find the target element itself. But what if the `href` contains a link to an external resource or some other invalid value? Let's check what happens if we pass not an element ID, but an external resource link.

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
* implement some kind of RegEx to check if the value is valid
* we can use a `try/catch`-block to handle the thrown `Error` case if the value is invalid

I've preferred the 2nd way, it's simplier than any RegEx solution. So the full code of `getScrollTargetElem()` looks like that.

```js
function getScrollTargetElem(clickedTargetElem: EventTarget | null) {
  if (!(clickedTargetElem instanceof Element)) {
    return null;
  }

  const clickedLinkElem = clickedTargetElem.closest(`.${DOM.navLink}`);

  if (!clickedLinkElem) {
    return null;
  }

  const clickedLinkElemHref = clickedLinkElem.getAttribute("href");

  if (!clickedLinkElemHref) {
    return null;
  }

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

## Function `smoothScrollTo()` and it's basic variables ([Table of Contents](#contents))

The actual function that performs all the magic is a function that smoothly scrolls to the target. We call it in the [event handler](#adding-event-listener-on-the-navigation-table-of-contents) after target definition, as it should know the point to which it should actually scroll. 

The crucial thing we need to know is how long our animation should last. In our case, the user should be able to set it directly as a ` smoothScrollTo()` parameter. Additionally, we will define a default value in case the user doesn't want to set any.

Don't forget about the callback to be called after the animation ends. So let's take a look at what the code looks like at this stage.

```js
// ... get navigation ...
 
const DEFAULT_SCROLL_ANIMATION_TIME = 500;

navigation?.addEventListener("click", (e) => {
  e.preventDefault();
  
  // - encapsulates many checks for finding the element 
  // to which we need to make a smooth scroll
  // - returns either an Element or null, and we handle what to do 
  // in both cases within the `smoothScrollTo` function 
  const scrollTargetElem = getScrollTargetElem(e.target);

  // all the magic will be here on link click
  smoothScrollTo({
    scrollTargetElem,
    // scrollDuration: some_time_in_ms || default value,
    onAnimationEnd: () => console.log("animation ends"),
  });
});

function smoothScrollTo({
  scrollTargetElem,
  scrollDuration = DEFAULT_SCROLL_ANIMATION_TIME,
  onAnimationEnd
}) {}
```

### Get the scroll start position

A crucial part of each custom scrolling is detecting the starting point. We can perform further calculations based on the coordinates of our current position on the page. In our case (vertical scrolling), we're interested in Y-coordinates only. 

The starting point is easy to obtain with `window.scrollY`. It's returned value is a double-precision floating-point value. In our example, such high precision for pixels is not needed, therefore, to simplify the final value, we will round it through a `Math.round()` function.

```js
function smoothScrollTo({
  scrollTargetElem,
  scrollDuration = DEFAULT_SCROLL_ANIMATION_TIME,
  onAnimationEnd
}) {
  if (!scrollTargetElem) {
    return;
  }

  const scrollStartPositionY = Math.round(window.scrollY);
  
  // ...
}
```
[Untitled_ Apr 5, 2023 4_03 PM.webm](https://user-images.githubusercontent.com/52240221/230088691-7c632ad0-5dac-484b-8308-bb43ec1a0a1b.webm)

### Get the scroll end position

We know the starting point of scrolling, and we need one more point - the Y-coordinate of where to scroll. It's a bit more tricky: we have no methods to directly grab the absolute document coordinate of the top-left corner of the target element. However, it's still possible, but we need two steps to obtain it:
* get the target element Y-coordinate relative to viewport
* calculate document absolute Y-coordinate for the target element

First we need to grab the target element's Y-coordinate relative to the user's viewport. Our helper for this task is the `getBoundingClientRect()` method. Check this [img from MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)

<img width="459" alt="getBoundingClientRect schema" src="https://user-images.githubusercontent.com/52240221/230092703-4b91ad4f-2a24-4a99-bcca-3fa4c8490d38.png">

```js
  const targetPositionYRelativeToViewport = Math.round(
    scrollTargetElem.getBoundingClientRect().top
  );

```

<img width="832" alt="Снимок экрана 2023-04-06 001122" src="https://user-images.githubusercontent.com/52240221/230212586-7bb7369f-45f1-49b5-9fa6-9266729970a5.png">

Secondly, the absolute target element Y-coordinate can be calc based on the start scroll position and the relative coordinate. The formula is:

```js
  const targetPositionY =
    targetPositionYRelativeToViewport + scrollStartPositionY;
```

Check the schemes below.

##### Example #1

<img width="1048" alt="Снимок экрана 2023-04-06 003133" src="https://user-images.githubusercontent.com/52240221/230216458-a51587a3-70f8-4955-8a41-2caaca9d3b58.png">

##### Example #2

<img width="1148" alt="Снимок экрана 2023-04-06 003707" src="https://user-images.githubusercontent.com/52240221/230217606-ad0f60f9-a418-4f1a-9da4-c01d53f0cc85.png">

##### Example #3

<img width="1147" alt="Снимок экрана 2023-04-06 004127" src="https://user-images.githubusercontent.com/52240221/230218478-cf973bf2-d066-475c-ba67-03447e0fc689.png">

So now `smoothScrollTo()` function looks like that:

```js
function smoothScrollTo({
  scrollTargetElem,
  scrollDuration = DEFAULT_SCROLL_ANIMATION_TIME,
  onAnimationEnd,
}) {
  if (!scrollTargetElem) {
    return;
  }

  const scrollStartPositionY = Math.round(window.scrollY);

  const targetPositionYRelativeToViewport = Math.round(
    scrollTargetElem.getBoundingClientRect().top
  );

  const targetPositionY =
    targetPositionYRelativeToViewport + scrollStartPositionY;
  
  // ...
}
```

### Get the scroll start timestamp

We calculated the start and end position of the scroll. However, this is not enough to implement our plan. Animation is a change of some parameter in time. Therefore, we also need to get the start time of the animation, relative to which `scrollDuration` will tick.

There are 2 options to get a 'now'-timestamp:
* `Date.now()`
* `performance.now()`

Both of them return a timestamp, but `performance.now()` is a highly-resolution one, much more precise. It's important to understand that the time used in the browser's internal scheduler is more important to animation than the number of scrolled pixels on the screen. Therefore, here we will not round the values, as in the case of pixels above. We should use this origin one to make the animation smooth and precise too.

For convenience, we can collect all the necessary information for the future playback of our animation into a single animationFrameSettings object.

```js
  const startScrollTime = performance.now();

  const animationFrameSettings = {
    startScrollTime,
    scrollDuration,
    scrollStartPositionY,
    targetPositionY,
    onAnimationEnd,
  };
```

### Define animation per frame function

Essentially, each animation is an event that occurs over a duration, and we can break down this time-based event into separate frames. Something like this

![hand-drawn-animation-frames-element-collection_23-2149845068](https://user-images.githubusercontent.com/52240221/230394813-c214930d-7ae1-4fae-aaa1-7c87c2d1dc3b.jpg)

So, we need a function that handles single frame motion, and based on it, we will build the entire animation

Let's define it as `animateSingleScrollFrame()` somewhere outside. We call it inside the `smoothScrollTo()` as a draft, and pass `animationFrameSettings` for further calculations to `animateSingleScrollFrame()`. Almost complete `smoothScrollTo()` code is here. Why almost? Because the browser should call `animateSingleScrollFrame()` when drawing the frame, and not the programmer himself. We will definitely fix this point a little later.

```js
function smoothScrollTo({
  scrollTargetElem,
  scrollDuration = DEFAULT_SCROLL_ANIMATION_TIME,
  onAnimationEnd,
}) {
  if (!scrollTargetElem) {
    return;
  }

  const scrollStartPositionY = Math.round(window.scrollY);

  const targetPositionYRelativeToViewport = Math.round(
    scrollTargetElem.getBoundingClientRect().top
  );

  const targetPositionY =
    targetPositionYRelativeToViewport + scrollStartPositionY;

  const startScrollTime = performance.now();

  const animationFrameSettings = {
    startScrollTime,
    scrollDuration,
    scrollStartPositionY,
    targetPositionY,
    onAnimationEnd,
  };

  animateSingleScrollFrame(animationFrameSettings)  
}

function animateSingleScrollFrame(animationFrameSettings) {}
```

## Function `animateSingleScrollFrame()` gives the progress of the animation ([Table of Contents](#contents))

For each frame, we want to check how much time has already been spent on the animation. We have a `startScrollTime` value and now need to know the current time to calculate the elapsed time

Technically, we would obtain a `currentTime` timestamp from `requestAnimationFrame()`, but we haven't implemented it yet. We will do so later. For now, we'll mock this value:

```js
  // The '100' here is a magic number, used for mock purposes only, 
  // and will be removed upon the implementation of requestAnimationFrame()
  const currentTime = performance.now() + 100;
```

The elapsed time will be used to calculate the animation progress. When we implement `requestAnimationFrame()`, `currentTime` (and therefore, `elapsedTime`) will be updated on each Event Loop tick.

```js
function animateSingleScrollFrame({startScrollTime, scrollDuration }) {

  // The '100' here is a magic number, used for mock purposes only, 
  // and will be removed upon the implementation of requestAnimationFrame()
  const currentTime = performance.now() + 100;
  
  // It's currently equal to 100ms due to the mock value
  const elapsedTime = currentTime - startScrollTime;
  
  // ...
}
```

### Calculate animation progress

The animation progress, which we calculate with the help of `elapsedTime`, shows how much of the animation is completed. We need an absolute progress ranging from 0 (beginning of the animation) to 1 (end of animation). This will help us calculate the scroll length in pixels per current frame later on

It will be updated on each Event Loop tick. We use `Math.min()` here because in real life a frame can be calculated in time that is already longer than the given `scrollDuration`. However, the animation progress end position must not exceed 1.

```js
  // If the progress exceeds 100% due to some browser lag, 
  // we'll stop at 1 and avoid errors here
  const absoluteAnimationProgress = Math.min(elapsedTime / scrollDuration, 1);
```

Now we have a linear animation progress. However, we often prefer non-linear animations that are a bit more intricate, featuring nice easing effects, such as starting slow, speeding up, and then slowing down again towards the end.

You can explore the most popular animation easing types based on Bezier Curves at [easings.net](https://easings.net/#). I've chosen the [easeInOutQuad](https://easings.net/#easeInOutQuad) mode for this project. On this page, you can find a function that calculates this easing effect:

```js
function easeInOutQuadProgress(animationProgress: number) {
  return animationProgress < 0.5
    ? 2 * animationProgress * animationProgress
    : -1 + (4 - 2 * animationProgress) * animationProgress;
}
```

This easing function takes the absolute animation progress, ranging between 0 and 1, and returns a corrected animation progress based on the easing calculation

If our animation progress is less than `50%`, it will increase this progress, so the animation starts slowly and then speeds up. If the progress is more than `50%`, the animation will smoothly slow down.

Let's create a wrapper function that takes `animationProgress` as a parameter and returns normalized progress from `easeInOutQuadProgress()`. I'm adding this extra function because later, we may want to handle more than just a single easing mode

```js 
function normalizeAnimationProgressByBezierCurve(animationProgress: number) {
  return easeInOutQuadProgress(animationProgress);
}
```

### Calculate scroll length per frame

The next step is to calculate how many pixels we should scroll during this animation frame, based on normalized animation progress and two coordinates: start position and target position. 

We've already calculated the start position and target position in the [`smoothScrollTo()`](#function-smoothscrollto-and-its-basic-variables-table-of-contents) function. We even collected all the necessary information for animation in a [single object](#get-the-scroll-start-timestamp) `animationFrameSettings`, which we pass to the `animateSingleScrollFrame()` function. Let's use this information.

Our desired value is absolute; we should know the length of the scroll path from the very start to the current frame point. The sign is for direction (we scroll up or down):

```js
function animateSingleScrollFrame({
    startScrollTime,
    scrollDuration,
    scrollStartPositionY,
    targetPositionY,
    onAnimationEnd
  }) {

  // ...

  const normalizedAnimationProgress = normalizeAnimationProgressByBezierCurve(
    absoluteAnimationProgress
  );

  const currentScrollLength =
    (targetPositionY - scrollStartPositionY) * normalizedAnimationProgress;
}
```

#### Example #1

<img width="1051" alt="image" src="https://user-images.githubusercontent.com/52240221/230448561-b66235f5-a586-4e27-9ad6-5db537f29234.png">

#### Example #2

<img width="861" alt="image" src="https://user-images.githubusercontent.com/52240221/230451269-5f62aa5e-3121-4dc5-bfe2-51f4b32a91a7.png">

### Let's scroll to the new Y-coordinate position!

Alright, the purpose of the `animateSingleScrollFrame()` function is to actually scroll. We need to know the actual Y-coordinate of the point we're scrolling to, and since we've done all the preliminary calculations, we're ready to calculate the stopping scroll point for the current frame:

```js
function animateSingleScrollFrame({
    startScrollTime,
    scrollDuration,
    scrollStartPositionY,
    targetPositionY,
  }) {
  // ... previous stuff
  
  const currentScrollLength =
    (targetPositionY - scrollStartPositionY) * normalizedAnimationProgress;
    
  const newPositionY = scrollStartPositionY + currentScrollLength;
}
```

#### Example #1
<img width="1044" alt="image" src="https://user-images.githubusercontent.com/52240221/230455012-1bc89900-9149-4bcb-998f-f725ed568aa6.png">

#### Example #2
<img width="1049" alt="image" src="https://user-images.githubusercontent.com/52240221/230455407-4fa18d89-2cc8-4939-8c7c-ad644236cafe.png">

Now it's time to scroll the page! Although it's not smooth at the moment, it works!

```js
function animateSingleScrollFrame({
    startScrollTime,
    scrollDuration,
    scrollStartPositionY,
    targetPositionY,
  }) {
  // ... previous stuff
    
  const newPositionY = scrollStartPositionY + currentScrollLength;
  
  window.scrollTo({
    top: newPositionY,
  });
}
```

In the video, you can see the difference in scroll length based on the dimension between `scrollStartPositionY` and `targetPositionY`:

[Untitled_ Apr 6, 2023 8_58 PM.webm](https://user-images.githubusercontent.com/52240221/230458661-7885e840-09f2-49c5-8182-4ea6ee071e65.webm)

## Separate Frames -> Animation

We have a function that handles a single frame, but an animation is a sequence of frames, and we need to call this function repeatedly until `the scrollDuration` is finished and the time is up to complete the animation.

The recursive `requestAnimationFrame()` will help us here. Fortunately, it's not as complicated as it might seem.

### What is `requestAnimationFrame()`?

`requestAnimationFrame()` (aka RAF) is a function that takes a callback with some animation as an argument, and then on each Event Loop tick, it nudges the browser to call this callback right before the repaint stage. 1 Event Loop tick -> 1 frame -> 1 `requestAnimationFrame()`. That's why we need to call it repeatedly until the animation is completed.

### Add a recursion into our code

Each recursion is based on 2 main points:
* a place for the first function call;
* a condition, in which if it is `true` we call the function again and again, and if it is `false` we stop the recursive function calls;

#### A place for the first function call

The first function call will be inside the `smoothScrollTo()` function as a starting animation point.

```js
function smoothScrollTo({
  scrollTargetElem,
  scrollDuration = DEFAULT_SCROLL_ANIMATION_TIME,
}) {
  // ... previous stuff

  // This is how we want to initially call RAF and pass an animation function as a callback
  requestAnimationFrame(animateSingleScrollFrame)
}
```

#### ⚠️ A Pitfall

By design, `requestAnimationFrame()` passes a `currentTime` timestamp as an argument to the callback. Do you remember when we mocked the `currentTime` earlier? We can't simply call RAF like this:

```js
requestAnimationFrame(animateSingleScrollFrame) 
```

... because the `animateSingleScrollFrame()` function should accept not only the currentTime argument, but also an object with the animation settings we've passed in it earlier.

We need to use an arrow function here:

```js
function smoothScrollTo({
  scrollTargetElem,
  scrollDuration = DEFAULT_SCROLL_ANIMATION_TIME,
}) {
  // ... previous stuff

  // all the things we've passed into `animateSingleScrollFrame` earlier
  const animationFrameSettings = {
    startScrollTime,
    scrollDuration,
    scrollStartPositionY,
    targetPositionY
  };
  
  // an actual RAF call
  requestAnimationFrame((currentTime) =>
    animateSingleScrollFrame(animationFrameSettings, currentTime)
  );
}
```

```js
function animateSingleScrollFrame(
  {
    startScrollTime,
    scrollDuration,
    scrollStartPositionY,
    targetPositionY,
  },
  currentTime: number
) {
  // ... a function inner content
}
```
#### Add a recursion repeating condition

This is a pretty straightforward thing. If our duration time is greater than the elapsed time, we have time for a new animation frame, so we should continue the recursive RAF:

```js
function animateSingleScrollFrame(
  {
    startScrollTime,
    scrollDuration,
    scrollStartPositionY,
    targetPositionY
  },
  currentTime: number
) {
 
  // ... previuos stuff

  const animationFrameSettings = {
    startScrollTime,
    scrollDuration,
    scrollStartPositionY,
    targetPositionY,
  };

  if (elapsedTime < scrollDuration) {
    requestAnimationFrame((currentTime) =>
      animateSingleScrollFrame(animationFrameSettings, currentTime)
    );
  }
}
```

### Remove `currentTime` mocks

Now we have a working recursion and an actual `currentTime` we have received from RAF. There could be a case when, on the first RAF call, `currentTime` is somehow smaller than `startScrollTime`. We should support this case and, if `elapsedTime < 0`, we return `0` there

```js
function animateSingleScrollFrame(
  {
    startScrollTime,
    scrollDuration,
    scrollStartPositionY,
    targetPositionY,
  },
  currentTime: number
) {
  
  // here, we remove the currentTime mocks and apply a Math.max to support the case when elapsedTime < 0
  const elapsedTime = Math.max(currentTime - startScrollTime, 0);
  
  // ... next stuff
  
}
```

## 🎉 It animates now!

[Untitled_ Apr 8, 2023 2_34 PM.webm](https://user-images.githubusercontent.com/52240221/230718929-876dd79e-8d6d-446b-80ee-bddb1ef22870.webm)

## The last thing: a callback on animation end

It's not a critical feature, just a nice small cherry on the cake. Let's add a callback that will be executed when the animation is fully completed.

We will pass it in the `smoothScrollTo()` function, as it is our entry point. Let's pass a small `console.log()` callback:

```js
navigation?.addEventListener("click", (e) => {
  // ... previous stuff

  smoothScrollTo({
    scrollTargetElem,
    // a simple on animation end callback
    onAnimationEnd: () => console.log("animation ends"),
  });
});
```

We do not use it directly in the `smoothScrollTo()`. Actually, it can be executed in the `animateSingleScrollFrame()`. We have a condition there to check if we have time to continue the animation or not. If we have no more time, it means that our animation ends, and we could call the callback:

```js
function smoothScrollTo({
  scrollTargetElem,
  scrollDuration = DEFAULT_SCROLL_ANIMATION_TIME,
  onAnimationEnd
}) {
  // ... previous stuff

  const animationFrameSettings = {
    startScrollTime,
    scrollDuration,
    scrollStartPositionY,
    targetPositionY,
    // add it as a new setting to the settings object
    onAnimationEnd
  };
  
  // ... next stuff
}
```

```js
function animateSingleScrollFrame(
  {
    startScrollTime,
    scrollDuration,
    scrollStartPositionY,
    targetPositionY,
    // we get it here as a setting
    onAnimationEnd,
  }: IAnimateSingleScrollFrame,
  currentTime: number
) {
  // ... previous stuff

  const animationFrameSettings = {
    startScrollTime,
    scrollDuration,
    scrollStartPositionY,
    targetPositionY,
    // add it as a new setting to the settings object
    onAnimationEnd,
  };

  if (elapsedTime < scrollDuration) {
    requestAnimationFrame((currentTime) =>
      animateSingleScrollFrame(animationFrameSettings, currentTime)
    );
  // check if a callback is passed to the function
  } else if (onAnimationEnd) {
    onAnimationEnd();
  }
}
```

[Untitled_ Apr 8, 2023 2_56 PM.webm](https://user-images.githubusercontent.com/52240221/230719801-3186ccbf-8623-445b-837b-a1588bf487dc.webm)

## A final word

We've built a fully complete Smooth Scroll concept. You can use it in your projects as is, or extend it with additional easing animations, end-of-animation callbacks, or other features! Feel free to use the code however you like!

I would be really glad to receive your feedback!


