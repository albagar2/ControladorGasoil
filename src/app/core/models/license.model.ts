export enum LicenseType {
    AM = "AM",
    A1 = "A1",
    A2 = "A2",
    A = "A",
    B1 = "B1",
    B = "B",
    C1 = "C1",
    C = "C",
    D1 = "D1",
    D = "D",
    BE = "BE",
    C1E = "C1E",
    CE = "CE",
    D1E = "D1E",
    DE = "DE"
}

export interface License {
    id?: number;
    type: LicenseType;
    expirationDate: string | Date;
    driverId?: number;
}
