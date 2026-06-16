import { Component } from '@angular/core';

interface Book {
  image: string;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-books',
  standalone: true,
  templateUrl: './books.component.html',
  styleUrl: './books.component.scss',
})
export class BooksComponent {
  readonly books: Book[] = [
    {
      image: '/images/book1.png',
      title: 'לגעת בנפש',
      subtitle: 'מאת הרב אייל אונגר שליט"א',
    },
    {
      image: '/images/book2.png',
      title: 'לגעת בנפש 2',
      subtitle: 'מאת הרב אייל אונגר שליט"א',
    },
    {
      image: '/images/book3.png',
      title: 'שלום בבית',
      subtitle: 'מאת הרב אייל אונגר שליט"א',
    },
  ];
}
