# smoothScrollTo Function Concept

## Event Listener Anatomy

Firstly we need to grab `navigation` element to add event listener to it. We should not apply listeners to links in the navigation direcly, it's a bad practice (check event delegation JS pattern).

```js
// I prefer to store all the DOM selector strings into a single object
const DOM = {
  nav: "navigation",
  navLink: "navigation__link",
};

const navigation = document.querySelector(`.${DOM.nav}`);
```
Now we add event listener to navigation and prevent all the default behavior of clicked link targets in it:

``` js
// we can't be sure that navigation element exists, so we need optional chaining
navigation?.addEventListener("click", (e) => {
  e.preventDefault();

});
```

Here we realize event delegation pattern: we check if the element is a navigation link or if it is a descendant of it. Iw it's not we leave the function and do nothing:

```js
navigation?.addEventListener("click", (e) => {
  e.preventDefault();

  // here I cast current target to HTMLElement, cause we click on html elements and no way it can be smth other then element
  const currentTarget = e.target as HTMLElement;
  const currentLink = currentTarget.closest(`.${DOM.navLink}`);

  if (!currentLink) {
    return;
  }
  
});
```
