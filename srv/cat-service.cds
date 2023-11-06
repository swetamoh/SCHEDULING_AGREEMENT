using my.bookshop as my from '../db/data-model';

service CatalogService {
    entity SchedulingAgreements as projection on my.SchedulingAgreements;
    entity DocumentRowItems as projection on my.DocumentRowItems;
}
