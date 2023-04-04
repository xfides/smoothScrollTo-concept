# smoothScrollTo() Function Concept

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

  // we must assure TS that currentTarget has an Element type
  // if it's not of the Element type, it's a strange error, and the function will return.
  if (!(currentTarget instanceof Element)) {
    return;
  }

  // also we interested in a link we actually click
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

We can't truly guarantee in TypeScript (without using dirty hacks) that JavaScript will 100% find this element in the DOM. That's why the implicit type of `currentLink` is `Element|null`.

So, we can pass it as an argument when `getScrollTargetElem` is called inside the event handler. Now, let's set it as a function parameter:

```js
function getScrollTargetElem(clickedLinkElem: Element | null) {
  if (!clickedLinkElem) {
    return null;
  }
  
  ...
}
```

### Obtain and validate link `href` value

The simpliest part is getting link's `href` value (and if there is no any we can't go further):

```js
function getScrollTargetElem(clickedLinkElem: Element | null) {
  if (!clickedLinkElem) {
    return null;
  }

  const clickedLinkElemHref = clickedLinkElem.getAttribute("href");

  if (!clickedLinkElemHref) {
    return null;
  }
  
  const scrollTarget = document.querySelector(clickedLinkElemHref);
}
```

The desired result is a scroll target element id like `#section1`, and we use it to find target element itself. But what if `href` contains a link to external resource or some other invalid value? Let's check what would be if we pass not an element id, but external resource:

```html
 <nav class="navigation">
   ...
   <a class="navigation__link" href="https://www.youtube.com/" target="_blank">Section 3</a>
</nav>
```

... and there is error that is thrown to us:

<img width="459" alt="Снимок экрана 2023-04-04 224856" src="https://user-images.githubusercontent.com/52240221/229903871-64d07466-1530-47d3-a439-fadc2c5086cf.png">
