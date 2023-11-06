namespace my.bookshop;

entity SchedulingAgreements{
  key SchNum:     String;
      SchDate:    String;
      VendorCode: String;
      VendorName: String;
      PlantCode:  String;
      PlantName:  String;
      DocStatus:  String;
      DocumentRows : Composition of many DocumentRowItems
                       on DocumentRows.PNum = $self;
}

entity DocumentRowItems {
  key UUID         : UUID;
      PoDate       : Date;
      VendorName   : String;
      VendorCode   : String;
      PlantCode    : String;
      PlantName    : String;
      LineNum      : Integer;
      ItemCode     : String;
      ItemDesc     : String;
      HSNCode      : String;
      PoQty        : Integer;
      DeliveredQty : Decimal;
      BalanceQty   : Decimal;
      UnitPrice    : Decimal;
      PNum         : Association to SchedulingAgreements;
}