/*
 * Copyright 2019 HM Revenue & Customs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package navigation

import base.SpecBase
import controllers.routes
import generators.Generators
import pages._
import models._
import org.scalacheck.Arbitrary.arbitrary
import org.scalacheck.Gen
import org.scalatestplus.scalacheck.ScalaCheckPropertyChecks

class NavigatorSpec extends SpecBase with ScalaCheckPropertyChecks with Generators {

  val navigator = new Navigator

  "Navigator" when {

    "in Normal mode" must {

      "go to Index from a page that doesn't exist in the route map" in {

        case object UnknownPage extends Page
        navigator.nextPage(UnknownPage, NormalMode, UserAnswers("id")) mustBe routes.IndexController.onPageLoad()
      }

      "go from Name to Phone Number" in {

        forAll(arbitrary[UserAnswers]) {
          answers =>

            navigator.nextPage(NamePage, NormalMode, answers) mustBe routes.PhoneNumberController.onPageLoad(NormalMode)
        }
      }

      "go from Phone Number to Contact Preferences" in {

        forAll(arbitrary[UserAnswers]) {
          answers =>

            navigator.nextPage(PhoneNumberPage, NormalMode, answers) mustBe routes.ContactPreferenceController.onPageLoad(NormalMode)
        }
      }

      "go from Contact Preferences to Address when the user answers Yes" in {

        forAll(arbitrary[UserAnswers]) {
          answers =>

            val updatedAnswers = answers.set(ContactPreferencePage, true).success.value

            navigator.nextPage(ContactPreferencePage, NormalMode, updatedAnswers) mustBe routes.AddressController.onPageLoad(NormalMode)
        }
      }

      "go from Contact Preferences to Check Your Answers when the user answers No" in {

        forAll(arbitrary[UserAnswers]) {
          answers =>

            val updatedAnswers = answers.set(ContactPreferencePage, false).success.value

            navigator.nextPage(ContactPreferencePage, NormalMode, updatedAnswers) mustBe routes.CheckYourAnswersController.onPageLoad()
        }
      }
    }

    "in Check mode" must {

      "go to CheckYourAnswers from a page that doesn't exist in the edit route map" in {

        case object UnknownPage extends Page
        navigator.nextPage(UnknownPage, CheckMode, UserAnswers("id")) mustBe routes.CheckYourAnswersController.onPageLoad()
      }

      "go from Name, PhoneNumber and Address pages to Check your Answers" in {

        val pageGen = Gen.oneOf(NamePage, PhoneNumberPage, AddressPage)

        forAll(arbitrary[UserAnswers], pageGen) {
          (answers, page) =>

          navigator.nextPage(page, CheckMode, answers) mustEqual routes.CheckYourAnswersController.onPageLoad()
        }
      }

      "go Check Your Answers to Address when the user answers Yes and Address is not answered" in {

        forAll(arbitrary[UserAnswers]) {
          answers =>

            val updatedAnswers =
              answers
                .set(ContactPreferencePage, true).success.value
                .remove(AddressPage).success.value

            navigator.nextPage(ContactPreferencePage, CheckMode, updatedAnswers) mustEqual routes.AddressController.onPageLoad(CheckMode)
        }
      }

      "go from Contact Preferences to Check Your Answers" when {

        "the user answers No" in {

          forAll(arbitrary[UserAnswers]) {
            answers =>

              val updatedAnswers = answers.set(ContactPreferencePage, false).success.value

              navigator.nextPage(ContactPreferencePage, CheckMode, updatedAnswers) mustEqual routes.CheckYourAnswersController.onPageLoad()
          }
        }

        "the user answers Yes and Address is already answered" in {

          forAll(arbitrary[UserAnswers], arbitrary[String]) {
            (answers, address) =>

              val updatedAnswers =
                answers
                  .set(ContactPreferencePage, true).success.value
                  .set(AddressPage, address).success.value

              navigator.nextPage(ContactPreferencePage, CheckMode, updatedAnswers) mustEqual routes.CheckYourAnswersController.onPageLoad()
          }
        }
      }
    }
  }
}
