/**
 * Every question on the partner form, and what counts as an answer.
 *
 * The form used to ask for a great deal and insist on three things: a
 * property name, a phone number and a ticked agreement. Everything else
 * could be left blank, so applications arrived at the desk with no bank
 * account, no tariff and no address, and somebody had to ring the
 * partner back for all of it.
 *
 * Both forms read these rules — the one a partner fills in on the
 * website and the one the desk fills in on their behalf — so the two
 * cannot drift apart.
 */

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
const PAN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const GST = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;
const TAN = /^[A-Z]{4}[0-9]{5}[A-Z]$/;
const IFSC = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const UPI = /^[\w.-]{2,}@[a-zA-Z]{2,}$/;

const text = (v) => String(v ?? '').trim();
const digits = (v) => text(v).replace(/\D/g, '');

/** A ten-digit Indian mobile, however it was typed. */
export const isPhone = (v) => /^[6-9]\d{9}$/.test(digits(v).slice(-10));
export const isEmail = (v) => EMAIL.test(text(v));
export const isPin = (v) => /^\d{6}$/.test(digits(v));
export const isPan = (v) => PAN.test(text(v).toUpperCase());
export const isGst = (v) => GST.test(text(v).toUpperCase());
export const isTan = (v) => TAN.test(text(v).toUpperCase());
export const isIfsc = (v) => IFSC.test(text(v).toUpperCase());
export const isUpi = (v) => UPI.test(text(v));
export const isAccountNumber = (v) => /^\d{9,18}$/.test(digits(v));
/** A positive amount. Nought is a real answer for a discount, not a rate. */
export const isMoney = (v) => text(v) !== '' && Number(v) >= 0 && Number.isFinite(Number(v));
export const isCount = (v) => text(v) !== '' && Number.isInteger(Number(v)) && Number(v) > 0;
export const isUrl = (v) => /^https?:\/\/\S+$/i.test(text(v));

/**
 * What is wrong with this application, step by step.
 *
 * Returns `{ 1: {...}, 2: {...} }` — errors keyed by the step they sit
 * on, so Next can stop on the step that needs work rather than sending
 * somebody back to the beginning.
 */
export function checkPartnerForm(form, kind) {
  const {
    account = {}, property = {}, location = {}, rooms = [], propertyPhotos = [], roomPhotos = [],
    amenities = [], facilities = [], rules = [], pricing = {}, inventory = {},
    policies = {}, ownership = {}, bank = {}, agreed = false,
  } = form;

  const steps = { 1: {}, 2: {}, 3: {}, 4: {}, 5: {} };

  /* -- 1. Who they are, and where ------------------------------------ */
  const one = steps[1];
  if (!text(account.accountType)) one.accountType = 'Choose what kind of account this is.';
  if (text(account.fullName).length < 2) one.fullName = 'Your full name, please.';
  if (!isEmail(account.email)) one.email = 'A working email address, please.';
  // The desk's own form has no sign-in number on it — it files the
  // property's contact number instead — so this is only asked where the
  // field exists, which is the form the partner fills in themselves.
  if ('phone' in account && !isPhone(account.phone)) one.phone = 'A 10-digit Indian mobile number.';
  if (!isPhone(account.alternatePhone)) one.alternatePhone = 'A second number we can reach you on.';

  if (!text(property.type)) one.type = 'Tell us what kind of place this is.';
  if (text(property.name).length < 2) one.name = 'Tell us the property name.';
  if (kind?.star && !text(property.starCategory)) one.starCategory = 'Choose a star category.';
  if (text(property.contactName).length < 2) one.contactName = 'Who should the desk ask for?';
  if (!isPhone(property.contactPhone)) one.contactPhone = 'A 10-digit number for the property.';
  if (!isEmail(property.contactEmail)) one.contactEmail = "The property's email address.";
  if (!text(property.bookingStartDate)) one.bookingStartDate = 'When can we start selling?';
  if (text(property.description).length < 30) {
    one.description = 'A few lines about the place — at least 30 characters.';
  }

  if (!text(location.line1)) one.line1 = 'The street address.';
  if (!text(location.line2)) one.line2 = 'The second address line.';
  if (!text(location.landmark)) one.landmark = 'A landmark nearby.';
  if (!text(location.city)) one.city = 'Which city?';
  if (!text(location.state)) one.state = 'Which state?';
  if (!text(location.country)) one.country = 'Which country?';
  if (!isPin(location.pin)) one.pin = 'A 6-digit PIN code.';
  if (text(location.latitude) === '' || Math.abs(Number(location.latitude)) > 90) {
    one.latitude = 'A latitude between -90 and 90.';
  }
  if (text(location.longitude) === '' || Math.abs(Number(location.longitude)) > 180) {
    one.longitude = 'A longitude between -180 and 180.';
  }
  if (!isUrl(location.mapsUrl)) one.mapsUrl = 'A link to the place on a map.';

  /* -- 2. What they are selling -------------------------------------- */
  const two = steps[2];
  if (!rooms.length) two.rooms = `Add at least one ${String(kind?.unit || 'room').toLowerCase()}.`;
  rooms.forEach((r, i) => {
    if (!text(r.name)) two[`room-${i}-name`] = 'Give it a name.';
    if (!text(r.type)) two[`room-${i}-type`] = 'What type is it?';
    if (!isCount(r.count)) two[`room-${i}-count`] = 'How many are there?';
    if (!text(r.size)) two[`room-${i}-size`] = 'How big is it?';
    if (kind?.bed && !text(r.bedType)) two[`room-${i}-bedType`] = 'Which bed type?';
    if (!isCount(r.maxOccupancy)) two[`room-${i}-maxOccupancy`] = 'How many does it take?';
    if (!isCount(r.adults)) two[`room-${i}-adults`] = 'How many adults?';
    if (text(r.children) === '' || Number(r.children) < 0) two[`room-${i}-children`] = 'How many children?';
    if (!text(r.amenities)) two[`room-${i}-amenities`] = 'What comes with it?';
    if (text(r.description).length < 20) two[`room-${i}-description`] = 'A line or two about it.';
    // Nobody books what they cannot see.
    if (kind?.extraBed && text(r.extraBed) === '') two[`room-${i}-extraBed`] = 'Is an extra bed possible?';
  });
  if (!propertyPhotos.length) two.propertyPhotos = 'Add at least one photograph.';
  if (!roomPhotos.length) two.roomPhotos = `Add at least one ${String(kind?.unit || 'room').toLowerCase()} photograph.`;

  /* -- 3. What is there ---------------------------------------------- */
  const three = steps[3];
  if (!amenities.length) three.amenities = 'Pick at least one amenity.';
  if (!facilities.length) three.facilities = 'Pick at least one facility.';
  if (!rules.length) three.rules = 'Pick at least one house rule.';

  /* -- 4. What it costs ---------------------------------------------- */
  const four = steps[4];
  if (!isMoney(pricing.standardTariff)) four.standardTariff = 'What does it normally cost?';
  if (!isMoney(pricing.partnerRate)) four.partnerRate = 'What is our rate?';
  if (!isMoney(pricing.weekdayRate)) four.weekdayRate = 'The weekday rate.';
  if (!isMoney(pricing.weekendRate)) four.weekendRate = 'The weekend rate.';
  if (kind?.extraBed) {
    if (!isMoney(pricing.extraAdultRate)) four.extraAdultRate = 'The extra adult rate.';
    if (!isMoney(pricing.childRate)) four.childRate = 'The child rate.';
  }
  if (kind?.meals && !(pricing.mealPlans || []).length) four.mealPlans = 'Pick at least one meal plan.';
  if (
    isMoney(pricing.partnerRate) && isMoney(pricing.standardTariff)
    && Number(pricing.partnerRate) > Number(pricing.standardTariff)
  ) {
    four.partnerRate = 'Our rate cannot be above the normal tariff.';
  }

  if (!isCount(inventory.totalRooms)) four.totalRooms = `How many ${String(kind?.units || 'rooms').toLowerCase()} in total?`;
  if (text(inventory.availableRooms) === '' || Number(inventory.availableRooms) < 0) {
    four.availableRooms = 'How many can we sell?';
  } else if (isCount(inventory.totalRooms) && Number(inventory.availableRooms) > Number(inventory.totalRooms)) {
    four.availableRooms = 'That is more than the total.';
  }
  if (!text(inventory.closedDates)) four.closedDates = 'Any closed dates — write "None" if there are none.';
  if (!text(inventory.blackoutDates)) four.blackoutDates = 'Any blackout dates — write "None" if there are none.';

  if (kind?.times === 'stay') {
    if (!text(policies.checkIn)) four.checkIn = 'Check-in time.';
    if (!text(policies.checkOut)) four.checkOut = 'Check-out time.';
  }
  if (!text(policies.freeCancellationUntil)) four.freeCancellationUntil = 'Free cancellation until when?';
  if (!text(policies.cancellationCharge)) four.cancellationCharge = 'What is charged after that?';
  if (!text(policies.noShowPolicy)) four.noShowPolicy = 'What happens on a no-show?';

  /* -- 5. Who owns it, and where the money goes ----------------------- */
  const five = steps[5];
  if (!text(ownership.type)) five.ownershipType = 'How is it owned?';
  if (!isPan(ownership.pan)) five.pan = 'A PAN like ABCDE1234F.';
  if (!isGst(ownership.gst)) five.gst = 'A 15-character GSTIN.';
  if (!isTan(ownership.tan)) five.tan = 'A TAN like MUMA12345B.';

  const links = ownership.documentLinks || {};
  if (!text(links.ownershipProof)) five.ownershipProof = 'Attach proof of ownership.';
  if (!text(links.leaseAgreement)) five.leaseAgreement = 'Attach the lease agreement.';
  if (!text(links.authorisation)) five.authorisation = 'Attach the authorisation letter.';

  if (text(bank.holder).length < 2) five.holder = "The account holder's name.";
  if (!text(bank.bankName)) five.bankName = 'Which bank?';
  if (!isAccountNumber(bank.accountNumber)) five.accountNumber = 'An account number of 9 to 18 digits.';
  if (!isIfsc(bank.ifsc)) five.ifsc = 'An IFSC like HDFC0001234.';
  if (!text(bank.branch)) five.branch = 'Which branch?';
  if (!text(bank.proofLink)) five.proofLink = 'Attach a cancelled cheque or passbook.';
  if (!isUpi(bank.upiId)) five.upiId = 'A UPI id like name@bank.';
  if (text(bank.upiName).length < 2) five.upiName = 'The name on the UPI account.';
  if (!text(bank.preferred)) five.preferred = 'How should we pay you?';

  if (!agreed) five.agreed = 'Please accept the partner agreement.';

  return steps;
}

/** Everything wrong, flattened, for the one list at the end. */
export function flatten(steps) {
  return Object.assign({}, ...Object.values(steps));
}

/** The first step that still needs work, or null. */
export function firstBadStep(steps) {
  const bad = Object.keys(steps).find((n) => Object.keys(steps[n]).length > 0);
  return bad ? Number(bad) : null;
}
